import crypto from 'crypto';
import Lead from '../models/Lead.js';
import OTP from '../models/OTP.js';
import { webinarConfig } from '../config/webinarConfig.js';
import { sendEmailOTP } from '../services/emailService.js';
import { generateCertificatePDF, sendCertificateEmail } from '../services/certificateService.js';
import { getProgramConfig } from '../config/programConfig.js';
import { env } from '../config/env.js';
import { sendLeadToZohoCRM } from '../services/zohoService.js';

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
    console.log("⏱️ Configured claim deadline:", webinarConfig.claimDeadline);

    if (!email || !webinarCode) {
      console.warn("⚠️ Missing email or webinarCode");
      return res.status(400).json({ 
        success: false, 
        message: "Email and Webinar Code are required" 
      });
    }

    const emailLower = email.trim().toLowerCase();

    // 1. Verify webinar code matches config
    console.log(`🔑 Validating webinar code. Config: '${webinarConfig.webinarCode}', Received: '${webinarCode.trim()}'`);
    if (webinarCode.trim() !== webinarConfig.webinarCode) {
      console.warn("❌ Invalid webinar code");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Webinar Code. Please use the code shared during the session." 
      });
    }

    // 2. Check claim deadline
    const deadline = new Date(webinarConfig.claimDeadline);
    if (now > deadline) {
      console.warn(`❌ Claim deadline has passed. Deadline: ${deadline.toISOString()}, Now: ${now.toISOString()}`);
      return res.status(400).json({ 
        success: false, 
        message: "Certificate claim period for this webinar has expired." 
      });
    }

    // 3. Check if a paid registration exists for this email and program
    console.log(`🔍 Querying Lead for email: '${emailLower}', program: '${program}' with paymentStatus: 'paid'`);
    let lead = await Lead.findOne({ email: emailLower, paymentStatus: 'paid', program });
    console.log("👤 Matched paid lead:", lead);

    if (!lead) {
      console.log(`🔍 Paid lead not found. Checking if any lead exists for email: '${emailLower}', program: '${program}'`);
      const anyLead = await Lead.findOne({ email: emailLower, program });
      console.log("👤 Matched any lead:", anyLead);

      if (!anyLead) {
        console.warn("❌ Lead not registered");
        return res.status(404).json({ 
          success: false, 
          message: "This email address is not registered for the webinar. Please verify your email." 
        });
      }

      // If lead exists but paymentStatus is not 'paid'
      console.warn(`❌ Lead exists but paymentStatus is '${anyLead.paymentStatus}' (expected: 'paid')`);
      return res.status(403).json({ 
        success: false, 
        message: "Webinar certificates are only available for paid participants." 
      });
    }

    // 5. Check if already claimed
    if (lead.certificateClaimed) {
      console.warn(`❌ Certificate already claimed for: ${emailLower}. ID: ${lead.certificateId}`);
      return res.status(400).json({ 
        success: false, 
        message: "A certificate has already been claimed for this registration." 
      });
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
        message: "Invalid Webinar Code." 
      });
    }

    // 2. Check claim deadline
    const now = new Date();
    const deadline = new Date(webinarConfig.claimDeadline);
    if (now > deadline) {
      return res.status(400).json({ 
        success: false, 
        message: "Certificate claim period has expired." 
      });
    }

    // 3. Verify OTP
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

    // 4. PREVENT RACE CONDITIONS: Atomic Claim Lock
    const lead = await Lead.findOneAndUpdate(
      { 
        email: emailLower, 
        paymentStatus: 'paid', 
        program,
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
      return res.status(400).json({ 
        success: false, 
        message: "Certificate has already been claimed or registration is invalid." 
      });
    }

    // 5. Generate unique sequential Certificate ID with random suffix for absolute collision safety
    const claimedCount = await Lead.countDocuments({ 
      certificateClaimed: true, 
      certificateId: { $ne: "" } 
    });
    const seq = String(claimedCount + 1).padStart(4, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random suffix
    const generatedId = `${webinarConfig.certificatePrefix}-${seq}-${randomSuffix}`;

    // 6. Generate and send PDF in a safe block, with rollback on failure
    let pdfPath = "";
    try {
      const programConfig = getProgramConfig(lead.program);
      pdfPath = await generateCertificatePDF({
        fullName: fullName.trim(),
        webinarTitle: programConfig.title,
        webinarDate: webinarConfig.webinarDate,
        mentorName: webinarConfig.mentorName,
        organizationName: webinarConfig.organizationName,
        certificateId: generatedId
      });

      // Email PDF to recipient
      await sendCertificateEmail(emailLower, fullName.trim(), pdfPath, programConfig.title, lead.program);

      // Save generated ID and timestamp to database
      lead.certificateId = generatedId;
      lead.claimedAt = new Date();
      await lead.save();

      // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
      try {
        console.log(`🔄 Syncing lead to Zoho CRM after certificate claim: ${lead.email}`);
        sendLeadToZohoCRM(lead);
      } catch (zohoErr) {
        console.error("❌ Zoho sync failed after certificate claim:", zohoErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "🎓 Certificate successfully sent to your email. Please check your Inbox/Spam folder."
      });

    } catch (processError) {
      console.error("❌ Certificate generation or delivery failed:", processError);

      // Rollback claim lock on failure
      await Lead.updateOne(
        { _id: lead._id }, 
        { 
          $set: { 
            certificateClaimed: false,
            certificateId: "",
            claimedAt: null
          } 
        }
      );

      return res.status(500).json({
        success: false,
        message: "Failed to generate or deliver certificate. Please contact support at hello@smven.com"
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
