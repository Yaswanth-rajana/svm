import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

/**
 * Authentication middleware for Student Portal APIs
 * Extracts student identity from header `x-student-email` or req.user
 * Auto-creates student record if missing, attaches `req.student`
 */
export const requireStudentAuth = async (req, res, next) => {
  try {
    let student = null;

    // 1. Try JWT Auth First
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "smven-secret-key-12345");
        student = await Student.findById(decoded.id);
        
        if (student && decoded.sessionId) {
          const sessionIndex = student.activeSessions.findIndex(s => s.sessionId === decoded.sessionId);
          if (sessionIndex === -1) {
            console.warn(`🔒 Session ${decoded.sessionId} has been invalidated for student: ${student.email}`);
            return res.status(401).json({
              success: false,
              message: "Unauthorized: Session invalidated (logged in on another device or session expired)",
            });
          } else {
            student.activeSessions[sessionIndex].lastActiveAt = new Date();
            student.activeSessions[sessionIndex].ipAddress = req.ip || "";
            student.activeSessions[sessionIndex].userAgent = req.headers["user-agent"] || "";
            await student.save();
          }
        }
      } catch (err) {
        console.warn("JWT verification failed, falling back to header if available:", err.message);
      }
    }

    // 2. Fallback to legacy x-student-email if no JWT (or invalid JWT)
    if (!student) {
      const studentEmail = req.headers["x-student-email"] || req.query?.email || req.body?.studentEmail;

      if (!studentEmail) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Missing or invalid authentication token",
        });
      }

      const email = studentEmail.toString().trim().toLowerCase();

      // Find or auto-provision student record
      student = await Student.findOne({ email });

      if (!student) {
        student = await Student.create({
          email,
          name: email.split("@")[0],
          isVerified: true,
        });
      }
    }

    req.student = student;
    console.log("🔐 Authenticated Student Portal Request:", {
      email: student?.email,
      id: student?._id,
      x_student_email: req.headers["x-student-email"],
      authHeader: req.headers.authorization ? "Present" : "Missing"
    });
    next();
  } catch (error) {
    console.error("❌ Error in requireStudentAuth middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during student authentication",
    });
  }
};
