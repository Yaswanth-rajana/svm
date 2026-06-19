import getLeadModel from "../utils/getLeadModel.js";
import OTP from "../models/OTP.js";
import { env } from "../config/env.js";
import { sendConfirmationEmail, sendCallRequestEmail, sendRegistrationAdminEmail, sendCallRequestAdminEmail, sendPendingPaymentAdminEmail } from "../services/emailService.js";
import { sendLeadToZohoCRM } from "../services/zohoService.js";
import { normalizePhone } from "../utils/phone.js";
import { maskEmail, maskPhone } from "../utils/logger.js";
import { createRegistrationInBigin } from "../services/biginService.js";

const ALLOWED_PROGRAMS = [
  "it-infrastructure",
  "cloud-computing",
  "devops-engineering",
  "virtualization-engineering",
  "server-engineering",
  "storage-engineering",
  "backup-engineering"
];



/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Public
 */
export const createLead = async (req, res) => {
  console.log(`📥 API Request received (createLead): Source=${req.body.source}, Phone=${req.body.phone ? maskPhone(normalizePhone(req.body.phone)) : 'N/A'}, Email=${req.body.email ? maskEmail(req.body.email) : 'N/A'}`);
  try {
    const { name, email, workingProfile, experience, program: reqProgram } = req.body;
    const program = reqProgram || "it-infrastructure";
    console.log("Received lead payload (createLead):", req.body);
    console.log("Program:", program);

    if (!ALLOWED_PROGRAMS.includes(program)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program",
      });
    }
    
    // Normalize input
    const phone = req.body.phone ? normalizePhone(req.body.phone) : undefined;
    const source = req.body.source?.toLowerCase();

    if (!phone || !source) {
      return res.status(400).json({
        success: false,
        message: "Phone and source are required",
      });
    }

    const leadType = program === "it-infrastructure" ? "infrastructure" : "course";
    const LeadModel = getLeadModel(program);

    // 1.5 Verify OTP first (except for brochure downloads)
    if (env.DISABLE_OTP_VALIDATION !== "true") {
      if (source !== 'brochure') {
        const verifiedOtp = await OTP.findOne({ 
          contact: { $in: [phone, email].filter(Boolean) }, 
          isVerified: true 
        });
        if (!verifiedOtp) {
          return res.status(400).json({
            success: false,
            message: "Please verify OTP first",
          });
        }
      }
    }

    // 2. Check if lead already exists using (email + program) or (phone + program)
    let lead = await LeadModel.findOne({
      program,
      $or: [
        { email: email.toLowerCase() },
        { phone }
      ]
    });

    if (lead) {
      // If already registered and paid for the program, block and return HTTP 409
      // (Except when they are just requesting a brochure download)
      if (lead.paymentStatus === "paid" && source !== "brochure") {
        return res.status(409).json({
          success: false,
          message: "You have already registered for this program."
        });
      }

      // Reuse the existing lead if payment is pending (or anything else)
      if (!lead.sources.includes(source)) {
        lead.sources.push(source);
      }

      // Keep details updated
      lead.name = name;
      lead.email = email.toLowerCase();
      lead.phone = phone;
      lead.leadType = leadType;
      if (workingProfile) lead.workingProfile = workingProfile;
      if (experience) lead.experience = experience;

      console.log("Lead before save (existing createLead):", lead);
      await lead.save();

      // 🔄 Sync lead to Zoho Bigin (Non-blocking & Fail-safe)
      if (!lead.biginRecordId) {
        try {
          const biginId = await createRegistrationInBigin(lead);
          lead.biginRecordId = biginId;
          lead.biginSyncStatus = "synced";
          lead.lastBiginSyncAt = new Date();
          lead.biginLastError = undefined; // clear error
          await lead.save();
        } catch (biginErr) {
          console.error("Bigin Sync Error:", biginErr.response?.data || biginErr.message);
          lead.biginSyncStatus = "failed";
          lead.biginLastError = biginErr.message;
          await lead.save();
        }
      }

      // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
      try {
        console.log(`🔄 Syncing lead to Zoho CRM: ${maskEmail(lead.email)}`);
        sendLeadToZohoCRM(lead);
      } catch (zohoErr) {
        console.error("❌ Zoho sync failed:", zohoErr.message);
      }

      return res.json({
        success: true,
        reusedLead: true,
        message: "You have registered but payment is pending. Proceeding to payment.",
        data: lead,
      });
    }

    console.log("Lead before save (new createLead):", {
      name,
      email,
      phone,
      sources: [source],
      workingProfile,
      experience,
      program,
      leadType,
    });
    // 🆕 New user
    lead = await LeadModel.create({
      name,
      email,
      phone,
      sources: [source],
      workingProfile,
      experience,
      program,
      leadType,
    });

    // 🔄 Sync lead to Zoho Bigin (Non-blocking & Fail-safe)
    try {
      const biginId = await createRegistrationInBigin(lead);
      lead.biginRecordId = biginId;
      lead.biginSyncStatus = "synced";
      lead.lastBiginSyncAt = new Date();
      lead.biginLastError = undefined; // clear error
      await lead.save();
    } catch (biginErr) {
      console.error("Bigin Sync Error:", biginErr.response?.data || biginErr.message);
      lead.biginSyncStatus = "failed";
      lead.biginLastError = biginErr.message;
      await lead.save();
    }

    // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
    try {
      console.log(`🔄 Syncing lead to Zoho CRM: ${maskEmail(lead.email)}`);
      sendLeadToZohoCRM(lead);
    } catch (zohoErr) {
      console.error("❌ Zoho sync failed:", zohoErr.message);
    }

    // Do NOT consume the OTP immediately. 
    // Let it expire naturally via TTL (5 mins) so users can perform multiple actions 
    // (like downloading a PDF after registering) without verifying twice.

    return res.json({
      success: true,
      message: "Registered successfully",
      data: lead,
    });
  } catch (error) {
    console.error("❌ Error creating lead:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this program."
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Request a call
 * @route   POST /api/request-call
 * @access  Public
 */
export const requestCall = async (req, res) => {
  try {
    const { name, email, preferredTime, message, program: reqProgram } = req.body;
    const program = reqProgram || "it-infrastructure";
    console.log("Received lead payload (requestCall):", req.body);
    console.log("Program:", program);

    if (!ALLOWED_PROGRAMS.includes(program)) {
      return res.status(400).json({
        success: false,
        message: "Invalid program",
      });
    }
    
    // Normalize input
    const phone = req.body.phone ? normalizePhone(req.body.phone) : undefined;
    const source = "call_request";

    // 1. Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and phone",
      });
    }

    const leadType = program === "it-infrastructure" ? "infrastructure" : "course";
    const LeadModel = getLeadModel(program);

    // 1.5 Verify OTP first
    if (env.DISABLE_OTP_VALIDATION !== "true") {
      const verifiedOtp = await OTP.findOne({ 
        contact: { $in: [phone, email].filter(Boolean) }, 
        isVerified: true 
      });
      if (!verifiedOtp) {
        return res.status(400).json({
          success: false,
          message: "Please verify OTP first",
        });
      }
    }

    console.log("📥 Request Call reached backend:", { name, email: maskEmail(email), phone: maskPhone(phone) });

    // 2. Check if lead exists using (email + program) or (phone + program) (Upsert logic)
    let lead = await LeadModel.findOne({
      program,
      $or: [
        { email: email.toLowerCase() },
        { phone }
      ]
    });

    if (lead) {
      console.log("✅ Lead found, updating sources to call_request");
      // Add call_request to sources if not already present
      if (!lead.sources.includes(source)) {
        lead.sources.push(source);
      }
      // Keep details updated
      lead.name = name;
      lead.email = email.toLowerCase();
      lead.phone = phone;
      lead.leadType = leadType;
      
      console.log("Lead before save (existing requestCall):", lead);
      await lead.save();
    } else {
      console.log("🆕 Creating new call request lead");
      console.log("Lead before save (new requestCall):", {
        name,
        email,
        phone,
        sources: [source],
        isVerified: true,
        program,
        leadType,
      });
      // Create new lead
      lead = await LeadModel.create({
        name,
        email,
        phone,
        sources: [source],
        isVerified: true,
        program,
        leadType,
      });
    }

    // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
    try {
      console.log(`🔄 Syncing lead to Zoho CRM: ${maskEmail(lead.email)}`);
      sendLeadToZohoCRM(lead);
    } catch (zohoErr) {
      console.error("❌ Zoho sync failed:", zohoErr.message);
    }

    console.log("🚀 Call request saved successfully:", maskEmail(lead.email));

    // 🚀 Send confirmation email (Non-blocking & Fail-safe)
    if (lead.email) {
      try {
        console.log(`📩 Call request email triggered for: ${lead.email}`);
        sendCallRequestEmail({ name: lead.name, email: lead.email, program: lead.program });
      } catch (emailErr) {
        console.error("❌ Call request email trigger failed:", emailErr.message);
      }

      try {
        console.log(`📩 Admin call request notification triggered for: ${maskEmail(lead.email)}`);
        sendCallRequestAdminEmail({ 
          name: lead.name, 
          email: lead.email, 
          phone: lead.phone, 
          preferredTime, 
          message,
          program: lead.program,
        });
      } catch (adminErr) {
        console.error("❌ Admin call request notification failed:", adminErr.message);
      }
    }

    // Do NOT consume the OTP immediately. 
    // Let it expire naturally via TTL (5 mins) so users can perform multiple actions 
    // (like downloading a PDF after registering) without verifying twice.

    res.status(200).json({
      success: true,
      message: "Call request submitted successfully",
      data: lead,
    });
  } catch (error) {
    console.error("❌ Error in requestCall:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already registered for this program."
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
