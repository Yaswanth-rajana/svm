import express from 'express';
import { sendCertificateOtp, verifyAndGenerateCertificate, downloadCertificatePdf } from '../controllers/certificateController.js';

const router = express.Router();

// POST /api/certificate/send-otp
router.post('/send-otp', sendCertificateOtp);

// POST /api/certificate/verify-and-generate
router.post('/verify-and-generate', verifyAndGenerateCertificate);

// GET /api/certificate/download/:certificateId
router.get('/download/:certificateId', downloadCertificatePdf);

export default router;

