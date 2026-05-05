import express from "express";
import { sendOtp, verifyOtp, resendOtp } from "../controllers/otpController.js";

const router = express.Router();

// POST /api/send-otp
router.post("/send-otp", sendOtp);

// POST /api/verify-otp
router.post("/verify-otp", verifyOtp);

// POST /api/resend-otp
router.post("/resend-otp", resendOtp);

export default router;
