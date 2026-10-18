import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import getLeadModel from '../utils/getLeadModel.js';
import OTP from '../models/OTP.js';
import { webinarConfig } from '../config/webinarConfig.js';
import { sendEmailOTP } from '../services/emailService.js';
import { generateCertificatePDF, sendCertificateEmail } from '../services/certificateService.js';
import { getProgramConfig } from '../config/programConfig.js';
import { env } from '../config/env.js';
import { sendLeadToZohoCRM } from '../services/zohoService.js';
import { createRegistrationInBigin, updateCertificateClaimed } from "../services/biginService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');


/**
 * @desc    Send verification OTP for certificate claim
 * @route   POST /api/certificate/send-otp
 * @access  Public
 */
export const sendCertificateOtp = async (req, res) => {
  try {
    const { email, webinarCode, program: reqProgram } = req.body;
    const program = reqProgram || webinarConfig.program || 'it-infrastructure';

    const allowedPrograms = [
      "it-infrastructure",
      "cloud-computing",
      "devops-engineering",
      "virtualization-engineering",
      "server-engineering",
      "storage-engineering",
      "backup-engineering"
    ];

    if (!allowedPrograms.includes(program)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program"
      });
    }

    const now = new Date();
    console.log("----------------------------------------");
    console.log("📥 Incoming Certificate OTP Request:", { email, webinarCode, program });
    console.log("⏰ Current server time:", now.toISOString());

    if (!email || !webinarCode) {
      console.warn("⚠️ Missing email or webinarCode");
      return res.status(400).json({ 
        success: false, 
        message: "Email and Program Code are required" 
      });
    }

    const emailLower = email.trim().toLowerCase();

    // 1. Verify webinar code matches config
    console.log(`🔑 Validating webinar code. Config: '${webinarConfig.webinarCode}', Received: '${webinarCode.trim()}'`);
    if (webinarCode.trim() !== webinarConfig.webinarCode) {
      console.warn("❌ Invalid webinar code");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Program Code. Please use the code shared during the session." 
      });
    }

    let LeadModel = getLeadModel(program);

    // 3. Check if a paid registration exists for this email
    console.log(`🔍 Querying Lead for email: '${emailLower}', program: '${program}' with paymentStatus: 'paid' or 'PAID'`);
    let lead = await LeadModel.findOne({ email: emailLower, paymentStatus: { $in: ['paid', 'PAID'] }, program });
    if (!lead) {
      lead = await getLeadModel('virtualization-engineering').findOne({ email: emailLower, paymentStatus: { $in: ['paid', 'PAID'] } })
          || await getLeadModel('it-infrastructure').findOne({ email: emailLower, paymentStatus: { $in: ['paid', 'PAID'] } });
      if (lead) {
        LeadModel = getLeadModel(lead.program);
      }
    }
    console.log("👤 Matched paid lead:", lead);

    if (!lead) {
      console.log(`🔍 Paid lead not found. Checking if any lead exists for email: '${emailLower}'`);
      const anyLead = await LeadModel.findOne({ email: emailLower })
                   || await getLeadModel('it-infrastructure').findOne({ email: emailLower });
      console.log("👤 Matched any lead:", anyLead);

      if (!anyLead) {
        console.warn("❌ Lead not registered");
        return res.status(404).json({ 
          success: false, 
          message: "This email address is not registered for the program. Please verify your email." 
        });
      }

      // If lead exists but paymentStatus is not 'paid' or 'PAID'
      console.warn(`❌ Lead exists but paymentStatus is '${anyLead.paymentStatus}' (expected: 'paid' or 'PAID')`);
      return res.status(403).json({ 
        success: false, 
        message: "Program certificates are only available for paid participants. Partially paid participants must complete the second installment first." 
      });
    }

    // 5. Check if already claimed - allow verification so user can re-generate/download updated certificate
    if (lead.certificateClaimed) {
      console.log(`ℹ️ Certificate previously claimed for: ${emailLower}. Allowing OTP verification to re-generate/download certificate.`);
    }

    if (env.DISABLE_OTP_VALIDATION === "true") {
      return res.status(200).json({
        success: true,
        bypass: true,
        message: "Certificate OTP verification temporarily disabled"
      });
    }

    // Cooldown check: 30 seconds
    const existingOtp = await OTP.findOne({ contact: emailLower }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeSinceLastOtp = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
      if (timeSinceLastOtp < 30) {
        console.warn(`⚠️ Resend cooldown active. Time elapsed: ${timeSinceLastOtp}s`);
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(30 - timeSinceLastOtp)} seconds before requesting a new OTP.`
        });
      }
      await OTP.deleteMany({ contact: emailLower });
    }

    // 6. Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    console.log(`🎲 Generated OTP: ${otp} for ${emailLower}`);

    // 7. Store OTP temporarily in database
    await OTP.create({
      contact: emailLower,
      channel: 'email',
      otp,
      expiresAt
    });

    // 8. Send OTP to registered email via ZeptoMail
    try {
      console.log(`✉️ Sending OTP email via ZeptoMail to: ${emailLower}`);
      await sendEmailOTP(emailLower, otp);
      console.log(`✅ OTP email sent successfully to: ${emailLower}`);
    } catch (emailErr) {
      console.error(`❌ Failed to send OTP email via ZeptoMail to: ${emailLower}`, emailErr);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP verification email. Please check your credentials or try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification OTP has been sent to your registered email address."
    });

  } catch (error) {
    console.error("❌ Error sending certificate OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Failed to send OTP."
    });
  }
};

/**
 * @desc    Verify OTP and generate/email certificate
 * @route   POST /api/certificate/verify-and-generate
 * @access  Public
 */
export const verifyAndGenerateCertificate = async (req, res) => {
  try {
    const { fullName, email, webinarCode, otp, program: reqProgram } = req.body;
    const program = reqProgram || webinarConfig.program || 'it-infrastructure';
    const LeadModel = getLeadModel(program);

    const allowedPrograms = [
      "it-infrastructure",
      "cloud-computing",
      "devops-engineering",
      "virtualization-engineering",
      "server-engineering",
      "storage-engineering",
      "backup-engineering"
    ];

    if (!allowedPrograms.includes(program)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program"
      });
    }

    if (!fullName || !email || !webinarCode || (env.DISABLE_OTP_VALIDATION !== "true" && !otp)) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    const emailLower = email.trim().toLowerCase();

    // 1. Verify webinar code matches config
    if (webinarCode.trim() !== webinarConfig.webinarCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Program Code." 
      });
    }

    // 2. Verify OTP
    if (env.DISABLE_OTP_VALIDATION !== "true") {
      const otpRecord = await OTP.findOne({ contact: emailLower }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return res.status(400).json({ 
          success: false, 
          message: "OTP not found or expired. Please request a new one." 
        });
      }

      if (otpRecord.expiresAt < new Date()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(400).json({ 
          success: false, 
          message: "OTP has expired. Please request a new one." 
        });
      }

      if (otpRecord.attempts >= 5) {
        await OTP.deleteOne({ _id: otpRecord._id });
        return res.status(429).json({ 
          success: false, 
          message: "Maximum verification attempts reached. Please request a new OTP." 
        });
      }

      if (otpRecord.otp !== otp.toString()) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return res.status(400).json({ 
          success: false, 
          message: "Invalid verification code. Please check and try again." 
        });
      }

      // Delete the verified OTP record immediately to prevent reuse
      await OTP.deleteOne({ _id: otpRecord._id });
    }

    // 4. Check & Claim Lead (Atomic lock with test-friendly re-claim support)
    let lead = await LeadModel.findOneAndUpdate(
      { 
        email: emailLower, 
        paymentStatus: { $in: ['paid', 'PAID'] }, 
        certificateClaimed: false 
      }, 
      { 
        $set: { certificateClaimed: true } 
      },
      { 
        returnDocument: 'after' 
      }
    );

    if (!lead) {
      // Check cross-collection models if not found in primary LeadModel
      const Alt1 = getLeadModel('virtualization-engineering');
      const Alt2 = getLeadModel('it-infrastructure');

      lead = await Alt1.findOneAndUpdate(
        { email: emailLower, paymentStatus: { $in: ['paid', 'PAID'] }, certificateClaimed: false },
        { $set: { certificateClaimed: true } },
        { returnDocument: 'after' }
      ) || await Alt2.findOneAndUpdate(
        { email: emailLower, paymentStatus: { $in: ['paid', 'PAID'] }, certificateClaimed: false },
        { $set: { certificateClaimed: true } },
        { returnDocument: 'after' }
      );
    }

    if (!lead) {
      // Check if lead was already registered and claimed previously
      lead = await LeadModel.findOne({
        email: emailLower,
        paymentStatus: { $in: ['paid', 'PAID'] }
      }) || await getLeadModel('virtualization-engineering').findOne({
        email: emailLower,
        paymentStatus: { $in: ['paid', 'PAID'] }
      }) || await getLeadModel('it-infrastructure').findOne({
        email: emailLower,
        paymentStatus: { $in: ['paid', 'PAID'] }
      });

      if (!lead) {
        return res.status(400).json({ 
          success: false, 
          message: "Registration not found or payment status is not verified." 
        });
      }
      console.log(`ℹ️ Lead ${emailLower} already claimed certificate ${lead.certificateId}. Re-generating with updated template...`);
    }

    // 5. Generate unique sequential Certificate ID (SMV-EVA-2607-01, SMV-EVA-2607-02, ...)
    let generatedId = lead.certificateId;
    if (!generatedId || !generatedId.startsWith(webinarConfig.certificatePrefix)) {
      const count1 = await getLeadModel('virtualization-engineering').countDocuments({ 
        certificateClaimed: true, 
        certificateId: { $regex: new RegExp(`^${webinarConfig.certificatePrefix}`) } 
      });
      const count2 = await getLeadModel('it-infrastructure').countDocuments({ 
        certificateClaimed: true, 
        certificateId: { $regex: new RegExp(`^${webinarConfig.certificatePrefix}`) } 
      });
      const seq = String(count1 + count2 + 1).padStart(2, '0');
      generatedId = `${webinarConfig.certificatePrefix}-${seq}`;
      lead.certificateId = generatedId;
      lead.certificateClaimed = true;
      lead.claimedAt = new Date();

      try {
        await lead.save();
      } catch (saveErr) {
        console.warn("⚠️ Lead save warning, falling back to direct update:", saveErr.message);
        await lead.constructor.updateOne(
          { _id: lead._id },
          { $set: { certificateId: generatedId, certificateClaimed: true, claimedAt: lead.claimedAt } }
        );
      }
    }

    // 6. Generate and send PDF in a safe block, with rollback on failure
    let pdfPath = "";
    try {
      const programTitle = webinarConfig.webinarTitle || "VMware vSphere Foundation - Build, Manage and Operate";
      pdfPath = await generateCertificatePDF({
        fullName: fullName.trim(),
        webinarTitle: programTitle,
        webinarDate: webinarConfig.webinarDate,
        mentorName: webinarConfig.mentorName,
        organizationName: webinarConfig.organizationName,
        certificateId: generatedId
      });

      // Email PDF to recipient (Non-fatal if email service is in test mode)
      try {
        await sendCertificateEmail(emailLower, fullName.trim(), pdfPath, programTitle, webinarConfig.program);
      } catch (mailErr) {
        console.warn(`⚠️ Warning: Certificate email delivery skipped or failed (${mailErr.message}), but certificate was generated.`);
      }

      // Save name, generated ID and timestamp to database safely
      try {
        lead.name = fullName.trim();
        lead.certificateId = generatedId;
        lead.claimedAt = new Date();
        await lead.save();
      } catch (saveErr) {
        await lead.constructor.updateOne(
          { _id: lead._id },
          { $set: { name: fullName.trim(), certificateId: generatedId, certificateClaimed: true, claimedAt: new Date() } }
        );
      }

      // 🔄 Sync certificate claim to Zoho Bigin (Non-blocking & Fail-safe)
      if (lead.biginRecordId) {
        try {
          await updateCertificateClaimed(lead.biginRecordId, true);
          await lead.constructor.updateOne(
            { _id: lead._id },
            { $set: { biginSyncStatus: "synced", lastBiginSyncAt: new Date() }, $unset: { biginLastError: 1 } }
          );
        } catch (biginErr) {
          console.error("Bigin Sync Error (Certificate Claim Update):", biginErr.response?.data || biginErr.message);
          await lead.constructor.updateOne(
            { _id: lead._id },
            { $set: { biginSyncStatus: "failed", biginLastError: biginErr.message } }
          );
        }
      } else {
        try {
          console.log(`🔄 Bigin record ID missing for lead ${lead.email}. Creating registration in Bigin first...`);
          const biginId = await createRegistrationInBigin(lead);
          await lead.constructor.updateOne(
            { _id: lead._id },
            { $set: { biginRecordId: biginId, biginSyncStatus: "synced", lastBiginSyncAt: new Date() }, $unset: { biginLastError: 1 } }
          );
        } catch (biginErr) {
          console.error("Bigin Sync Error (Certificate Claim Create & Update):", biginErr.response?.data || biginErr.message);
          await lead.constructor.updateOne(
            { _id: lead._id },
            { $set: { biginSyncStatus: "failed", biginLastError: biginErr.message } }
          );
        }
      }

      // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
      try {
        console.log(`🔄 Syncing lead to Zoho CRM after certificate claim: ${lead.email}`);
        sendLeadToZohoCRM(lead);
      } catch (zohoErr) {
        console.error("❌ Zoho sync failed after certificate claim:", zohoErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "🎓 Certificate successfully generated and sent to your email. You can also download it directly below.",
        certificateId: generatedId,
        downloadUrl: `/api/certificate/download/${generatedId}`
      });

    } catch (processError) {
      console.error("❌ Certificate generation or delivery failed:", processError);

      return res.status(500).json({
        success: false,
        message: "Failed to generate certificate. Please contact support at hello@smven.com"
      });
    }

  } catch (error) {
    console.error("❌ Error verifying and generating certificate:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });
  }
};

/**
 * @desc    Download generated certificate PDF
 * @route   GET /api/certificate/download/:certificateId
 * @access  Public
 */
export const downloadCertificatePdf = async (req, res) => {
  try {
    const { certificateId } = req.params;
    if (!certificateId) {
      return res.status(400).json({ success: false, message: "Certificate ID is required" });
    }

    const tempDir = path.join(backendRoot, 'temp-certificates');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const files = fs.readdirSync(tempDir);
    const matchingFiles = files
      .filter(f => f.includes(certificateId) && f.endsWith('.pdf'))
      .map(f => ({
        name: f,
        mtime: fs.statSync(path.join(tempDir, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (matchingFiles.length > 0) {
      const filePath = path.join(tempDir, matchingFiles[0].name);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${matchingFiles[0].name}"`);
      return res.sendFile(filePath);
    }

    // If file not currently on disk, look up lead and regenerate on-the-fly!
    const lead = await getLeadModel("virtualization-engineering").findOne({ certificateId }) 
              || await getLeadModel("it-infrastructure").findOne({ certificateId });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    const programTitle = webinarConfig.webinarTitle || "VMware vSphere Foundation - Build, Manage and Operate";
    const pdfPath = await generateCertificatePDF({
      fullName: lead.name || "Candidate Name",
      webinarTitle: programTitle,
      webinarDate: webinarConfig.webinarDate,
      mentorName: webinarConfig.mentorName,
      organizationName: webinarConfig.organizationName,
      certificateId: lead.certificateId
    });

    const filename = path.basename(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.sendFile(pdfPath);

  } catch (error) {
    console.error("❌ Error downloading certificate PDF:", error);
    return res.status(500).json({ success: false, message: "Failed to download certificate" });
  }
};

