import express from "express";
import { sendOtp, verifyOtp, resendOtp, checkOtpStatus } from "../controllers/otpController.js";

const router = express.Router();

// POST /api/send-otp
router.post("/send-otp", sendOtp);

// POST /api/verify-otp
router.post("/verify-otp", verifyOtp);

// POST /api/check-otp-status
router.post("/check-otp-status", checkOtpStatus);

// POST /api/resend-otp
router.post("/resend-otp", resendOtp);

export default router;
