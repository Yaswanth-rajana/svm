import express from 'express';
import { sendCertificateOtp, verifyAndGenerateCertificate } from '../controllers/certificateController.js';

const router = express.Router();

// POST /api/certificate/send-otp
router.post('/send-otp', sendCertificateOtp);

// POST /api/certificate/verify-and-generate
router.post('/verify-and-generate', verifyAndGenerateCertificate);

export default router;
