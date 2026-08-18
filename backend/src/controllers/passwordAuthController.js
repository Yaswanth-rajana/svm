import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Student from "../models/Student.js";
import OTP from "../models/OTP.js";
import { normalizePhone } from "../utils/phone.js";

// Helper: Generate JWT Token with sessionId
export const generateToken = (studentId, rememberMe = false, sessionId = crypto.randomUUID()) => {
  const expiresIn = rememberMe ? "30d" : "7d";
  return jwt.sign({ id: studentId, sessionId }, process.env.JWT_SECRET || "smven-secret-key-12345", {
    expiresIn,
  });
};

// Helper: Register a new device session, tracking up to 2 active sessions
export const registerSession = async (student, req) => {
  const sessionId = crypto.randomUUID();
  if (!student.activeSessions) {
    student.activeSessions = [];
  }

  student.activeSessions.push({
    sessionId,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip || "",
    lastActiveAt: new Date(),
  });

  // Limit to maximum 2 concurrent sessions
  if (student.activeSessions.length > 2) {
    student.activeSessions.sort((a, b) => a.lastActiveAt - b.lastActiveAt);
    while (student.activeSessions.length > 2) {
      const removed = student.activeSessions.shift();
      console.log(`🔒 Device session limit exceeded. Purging session ${removed.sessionId} for student: ${student.email}`);
    }
  }

  await student.save();
  return sessionId;
};

/**
 * @desc    Login using Email and Password
 * @route   POST /api/auth/login-password
 * @access  Public
 */
export const loginWithPassword = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const formattedEmail = email.toString().trim().toLowerCase();
    
    // Find student and select passwordHash explicitly
    const student = await Student.findOne({ email: formattedEmail }).select("+passwordHash");

    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!student.passwordCreated) {
      return res.status(400).json({ 
        success: false, 
        message: "No password set for this account. Please use Email OTP to login and set a password." 
      });
    }

    // Check Account Lockout
    if (student.accountLockedUntil && student.accountLockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((student.accountLockedUntil - new Date()) / 1000 / 60);
      return res.status(403).json({ 
        success: false, 
        message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes or login using Email OTP.` 
      });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, student.passwordHash);

    if (!isMatch) {
      student.failedLoginAttempts = (student.failedLoginAttempts || 0) + 1;
      
      // Lock account after 5 failed attempts
      if (student.failedLoginAttempts >= 5) {
        student.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      }
      await student.save();

      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Success - Reset lockouts
    student.failedLoginAttempts = 0;
    student.accountLockedUntil = undefined;
    student.lastLoginMethod = "password";
    student.lastLoginAt = new Date();
    student.rememberMeEnabled = !!rememberMe;
    
    const sessionId = await registerSession(student, req);
    const token = generateToken(student._id, rememberMe, sessionId);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      studentId: student.studentId,
      passwordCreated: student.passwordCreated
    });
  } catch (error) {
    console.error("❌ Error in loginWithPassword:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Set initial password (Onboarding)
 * @route   POST /api/auth/set-password
 * @access  Private (Student)
 */
export const setPassword = async (req, res) => {
  try {
    const student = req.student;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Check if password already exists
    const dbStudent = await Student.findById(student._id).select("+passwordHash");
    if (dbStudent.passwordCreated) {
      return res.status(400).json({ success: false, message: "Password already exists. Use Change Password instead." });
    }

    const salt = await bcrypt.genSalt(12);
    dbStudent.passwordHash = await bcrypt.hash(password, salt);
    dbStudent.passwordCreated = true;
    dbStudent.passwordCreatedAt = new Date();
    await dbStudent.save();

    return res.status(200).json({ success: true, message: "Password created successfully" });
  } catch (error) {
    console.error("❌ Error in setPassword:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Change existing password
 * @route   POST /api/auth/change-password
 * @access  Private (Student)
 */
export const changePassword = async (req, res) => {
  try {
    const student = req.student;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Invalid input. New password must be at least 8 characters." });
    }

    const dbStudent = await Student.findById(student._id).select("+passwordHash");

    if (!dbStudent.passwordCreated) {
      return res.status(400).json({ success: false, message: "No password exists. Use Set Password instead." });
    }

    const isMatch = await bcrypt.compare(currentPassword, dbStudent.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const isSame = await bcrypt.compare(newPassword, dbStudent.passwordHash);
    if (isSame) {
      return res.status(400).json({ success: false, message: "New password cannot match the current password." });
    }

    const salt = await bcrypt.genSalt(12);
    dbStudent.passwordHash = await bcrypt.hash(newPassword, salt);
    dbStudent.lastPasswordChange = new Date();
    await dbStudent.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Error in changePassword:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Reset password via OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Email, valid OTP, and a strong new password are required." });
    }

    const formattedEmail = email.toString().trim().toLowerCase();

    // 1. Verify OTP
    const otpRecord = await OTP.findOne({ contact: formattedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ success: false, message: "Maximum verification attempts reached." });
    }

    if (otpRecord.otp !== otp.toString()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // 2. OTP is valid, clean it up
    await OTP.deleteMany({ contact: formattedEmail });

    // 3. Find and update Student
    let student = await Student.findOne({ email: formattedEmail }).select("+passwordHash");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student account not found." });
    }

    const salt = await bcrypt.genSalt(12);
    student.passwordHash = await bcrypt.hash(newPassword, salt);
    student.passwordCreated = true;
    
    if (!student.passwordCreatedAt) {
      student.passwordCreatedAt = new Date();
    } else {
      student.lastPasswordChange = new Date();
    }
    
    // Unlock account if it was locked
    student.failedLoginAttempts = 0;
    student.accountLockedUntil = undefined;
    
    await student.save();

    return res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("❌ Error in resetPassword:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
