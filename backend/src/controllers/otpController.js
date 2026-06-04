import mongoose from "mongoose";
import crypto from "crypto";
import OTP from "../models/OTP.js";
import { sendWhatsAppOTP } from "../services/whatsappService.js";
import { sendEmailOTP } from "../services/emailService.js";
import { normalizePhone } from "../utils/phone.js";
import { env } from "../config/env.js";

/**
 * @desc    Send OTP via WhatsApp with Email fallback
 * @route   POST /api/send-otp
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  try {
    if (env.DISABLE_OTP_VALIDATION === "true") {
      return res.status(200).json({
        success: true,
        bypass: true,
        message: "OTP verification temporarily disabled"
      });
    }

    const { phone, email, channel = 'whatsapp' } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: "Phone or email is required" });
    }

    // Format phone if provided
    const formattedPhone = phone ? normalizePhone(phone) : null;
    
    // Choose primary contact based on requested channel
    let primaryContact = channel === 'email' && email ? email : (formattedPhone || email);
    let primaryChannel = channel === 'email' && email ? 'email' : (formattedPhone ? 'whatsapp' : 'email');

    // Check cooldown for primary contact (30 seconds)
    const existingOtp = await OTP.findOne({ contact: primaryContact }).sort({ createdAt: -1 });

    if (existingOtp) {
      const timeSinceLastOtp = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (timeSinceLastOtp < 30) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(30 - timeSinceLastOtp)} seconds before requesting a new OTP.`
        });
      }
      
      // Prevent accumulating too many OTP docs, clean up older ones
      await OTP.deleteMany({ contact: primaryContact });
    }

    // Generate 6-digit OTP using cryptographically secure random numbers
    const otp = crypto.randomInt(100000, 999999).toString();


    // Expiry: 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let sentChannel = primaryChannel;
    let usedContact = primaryContact;
    let wasFallback = false;

    try {
      if (primaryChannel === 'whatsapp') {
        await sendWhatsAppOTP(formattedPhone, otp);
      } else {
        await sendEmailOTP(email, otp);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to send via ${primaryChannel}. Attempting fallback...`);
      // Fallback logic
      wasFallback = true;
      if (primaryChannel === 'whatsapp' && email) {
        try {
          await sendEmailOTP(email, otp);
          sentChannel = 'email';
          usedContact = email;
        } catch (fallbackError) {
          console.error("❌ Fallback to email failed:", fallbackError);
          return res.status(500).json({ success: false, message: "Failed to send OTP via all channels" });
        }
      } else if (primaryChannel === 'email' && formattedPhone) {
        try {
          await sendWhatsAppOTP(formattedPhone, otp);
          sentChannel = 'whatsapp';
          usedContact = formattedPhone;
        } catch (fallbackError) {
          console.error("❌ Fallback to WhatsApp failed:", fallbackError);
          return res.status(500).json({ success: false, message: "Failed to send OTP via all channels" });
        }
      } else {
        return res.status(500).json({ success: false, message: `Failed to send OTP via ${primaryChannel} and no fallback available` });
      }
    }

    // Save to DB
    await OTP.create({
      contact: usedContact,
      channel: sentChannel,
      otp,
      expiresAt
    });

    return res.status(200).json({
      success: true,
      channel: sentChannel,
      contact: usedContact,
      fallback: wasFallback,
      delivery: sentChannel === 'whatsapp' ? 'uncertain' : 'assumed',
      message: `OTP sent successfully via ${sentChannel}`
    });

  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    if (env.DISABLE_OTP_VALIDATION === "true") {
      return res.status(200).json({
        success: true,
        verified: true,
        bypass: true
      });
    }

    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return res.status(400).json({ success: false, message: "Contact and OTP are required" });
    }

    const isPhone = !contact.includes('@');
    const formattedContact = isPhone ? normalizePhone(contact) : contact;

    const otpRecord = await OTP.findOne({ contact: formattedContact }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    // Check expiration manually just in case TTL hasn't cleared it yet
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // Check attempts limit (Max 5 attempts)
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({ success: false, message: "Maximum verification attempts reached. Please request a new OTP." });
    }

    // Verify OTP
    if (otpRecord.otp !== otp.toString()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid
    otpRecord.isVerified = true;
    await otpRecord.save();

    // Optionally delete older unverified OTPs for the same contact
    // Using string ID and wrapping in try-catch to avoid non-critical CastErrors
    try {
      if (otpRecord && otpRecord._id) {
        await OTP.deleteMany({ 
          contact: formattedContact, 
          _id: { $ne: otpRecord._id.toString() } 
        });
      }
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup of old OTPs failed (non-critical):", cleanupError.message);
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  // This basically delegates to sendOtp but we might explicitly want to switch channels
  return sendOtp(req, res);
};
