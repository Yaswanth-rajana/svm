import Lead from "../models/Lead.js";
import OTP from "../models/OTP.js";
import { sendConfirmationEmail, sendCallRequestEmail, sendRegistrationAdminEmail, sendCallRequestAdminEmail, sendPendingPaymentAdminEmail } from "../services/emailService.js";
import { sendLeadToZohoCRM } from "../services/zohoService.js";
import { normalizePhone } from "../utils/phone.js";
import { maskEmail, maskPhone } from "../utils/logger.js";


/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Public
 */
export const createLead = async (req, res) => {
  try {
    const { name, email, workingProfile, experience } = req.body;
    
    // Normalize input
    const phone = req.body.phone ? normalizePhone(req.body.phone) : undefined;
    const source = req.body.source?.toLowerCase();

    if (!phone || !source) {
      return res.status(400).json({
        success: false,
        message: "Phone and source are required",
      });
    }

    // 1.5 Verify OTP first
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

    // 2. Check if lead already exists by phone
    let lead = await Lead.findOne({ phone });

    if (lead) {
      // ❌ If already registered for same source
      if (lead.sources.includes(source)) {
        if (source === "webinar" && lead.paymentStatus !== "paid") {
          return res.json({
            success: true,
            message: "You have registered but payment is pending. Proceeding to payment.",
            data: lead,
          });
        }
        return res.json({
          success: false,
          message: "You have already registered for this",
        });
      }

      // ✅ New action → add source
      lead.sources.push(source);
      await lead.save();

      // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
      try {
        console.log(`🔄 Syncing lead to Zoho CRM: ${maskEmail(lead.email)}`);
        sendLeadToZohoCRM(lead);
      } catch (zohoErr) {
        console.error("❌ Zoho sync failed:", zohoErr.message);
      }


      // Removed email sending for webinar (now handled during payment verification)

      // Do NOT consume the OTP immediately. 
      // Let it expire naturally via TTL (5 mins) so users can perform multiple actions 
      // (like downloading a PDF after registering) without verifying twice.

      return res.json({
        success: true,
        message: "Your action has been recorded",
        data: lead,
      });
    }

    // 🆕 New user
    lead = await Lead.create({
      name,
      email,
      phone,
      sources: [source],
      workingProfile,
      experience,
    });

    // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
    try {
      console.log(`🔄 Syncing lead to Zoho CRM: ${maskEmail(lead.email)}`);
      sendLeadToZohoCRM(lead);
    } catch (zohoErr) {
      console.error("❌ Zoho sync failed:", zohoErr.message);
    }


    // Removed email sending for webinar (now handled during payment verification)

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
    const { name, email, preferredTime, message } = req.body;
    
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

    // 1.5 Verify OTP first
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

    console.log("📥 Request Call reached backend:", { name, email: maskEmail(email), phone: maskPhone(phone) });

    // 2. Check if lead exists (Upsert logic)
    let lead = await Lead.findOne({ phone });

    if (lead) {
      console.log("✅ Lead found, updating sources to call_request");
      // Add call_request to sources if not already present
      if (!lead.sources.includes(source)) {
        lead.sources.push(source);
      }
      await lead.save();
    } else {
      console.log("🆕 Creating new call request lead");
      // Create new lead
      lead = await Lead.create({
        name,
        email,
        phone,
        sources: [source],
        isVerified: true,
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
        sendCallRequestEmail({ name: lead.name, email: lead.email });
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
          message 
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
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
