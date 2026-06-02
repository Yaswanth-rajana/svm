import Razorpay from "razorpay";
import crypto from "crypto";
import Lead from "../models/Lead.js";
import { sendConfirmationEmail, sendRegistrationAdminEmail, sendFailedPaymentAdminEmail } from "../services/emailService.js";
import { sendLeadToZohoCRM } from "../services/zohoService.js";
import { maskEmail, logger } from "../utils/logger.js";


/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Public
 */
export const createOrder = async (req, res) => {
  try {
    const { amount, leadId } = req.body; // Amount in INR

    if (!amount || !leadId) {
      return res.status(400).json({ success: false, message: "Amount and leadId are required" });
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    console.log(`🔑 [CreateOrder] Using key_id: ${keyId}`);

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${leadId.slice(-8)}_${Date.now().toString().slice(-6)}`,
    };

    const order = await instance.orders.create(options);
    console.log(`📦 [CreateOrder] Created order:`, order.id);

    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create order" });
    }

    const lead = await Lead.findById(leadId);
    if (lead) {
      lead.razorpayOrderId = order.id;
      await lead.save();
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/payment/verify
 * @access  Public
 */
export const verifyPayment = async (req, res) => {
  try {
    logger.info("Payment verification API hit");
    console.log("Payment verification API hit");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leadId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !leadId) {
      logger.error("Payment verification failed: Missing parameters");
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    logger.info("Calling verification API logic");
    
    console.log("Received payment id:", razorpay_payment_id);
    console.log("Received order id:", razorpay_order_id);
    console.log("Received signature:", razorpay_signature);

    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Generated signature:", generatedSignature);
    console.log(
       "Signature Match:",
       generatedSignature === razorpay_signature
    );

    if (generatedSignature === razorpay_signature) {
      // Payment is successful
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ success: false, message: "Lead not found" });
      }

      // Fetch payment details from Razorpay to get method, amount, etc.
      let paymentDetails = {};
      try {
        const instance = new Razorpay({
          key_id: secret ? (process.env.RAZORPAY_KEY_ID || "").trim() : "",
          key_secret: secret,
        });
        paymentDetails = await instance.payments.fetch(razorpay_payment_id);
      } catch (payErr) {
        console.error("⚠️ Failed to fetch payment details from Razorpay:", payErr.message);
      }

      // Update lead
      lead.paymentStatus = "paid";
      lead.razorpayOrderId = razorpay_order_id;
      lead.razorpayPaymentId = razorpay_payment_id;

      // Future-ready fields
      lead.paymentDate = new Date();
      lead.paymentMethod = paymentDetails.method || "unknown";
      lead.transactionId = razorpay_payment_id;
      lead.amountPaid = paymentDetails.amount ? paymentDetails.amount / 100 : 0;

      await lead.save();
      logger.info("Payment verification successful");

      // 🚀 Send email ONLY for webinar (Non-blocking & Fail-safe)
      try {
        console.log(`📩 Webinar email triggered for: ${maskEmail(lead.email)}`);
        sendConfirmationEmail({ name: lead.name, email: lead.email, program: lead.program });
      } catch (emailErr) {
        console.error("❌ Email trigger failed:", emailErr.message);
      }

      try {
        console.log(`📩 Admin webinar notification triggered for: ${maskEmail(lead.email)}`);
        sendRegistrationAdminEmail({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          workingProfile: lead.workingProfile,
          experience: lead.experience,
          paymentStatus: lead.paymentStatus,
          program: lead.program,
        });
      } catch (adminErr) {
        console.error("❌ Admin notification failed:", adminErr.message);
      }

      // 🔄 Sync lead to Zoho CRM (Non-blocking & Fail-safe)
      try {
        console.log(`🔄 Syncing lead to Zoho CRM: ${maskEmail(lead.email)}`);
        sendLeadToZohoCRM(lead);
      } catch (zohoErr) {
        console.error("❌ Zoho sync failed:", zohoErr.message);
      }

      return res.status(200).json({ success: true, message: "Payment verified successfully", data: lead });
    } else {
      console.error("Razorpay signature verification failed");
      logger.error("Payment verification failed: Invalid signature");
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    logger.error("Payment verification failed: Exception occurred", error.message);
    console.error("❌ Error verifying Razorpay payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Handle Razorpay Payment Failure
 * @route   POST /api/payment/fail
 * @access  Public
 */
export const handlePaymentFailure = async (req, res) => {
  try {

    const { leadId, razorpay_order_id, razorpay_payment_id, error_description } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: "LeadId is required" });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Update status to failed
    lead.paymentStatus = "failed";
    if (razorpay_order_id) lead.razorpayOrderId = razorpay_order_id;
    if (razorpay_payment_id) lead.razorpayPaymentId = razorpay_payment_id;

    await lead.save();

    // Trigger admin notification for failed payment
    try {
      sendFailedPaymentAdminEmail({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        registrationTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        paymentMethod: "Razorpay (Modal Exit or Declined)",
        program: lead.program,
      });
    } catch (adminErr) {
      console.error("❌ Failed to trigger failed payment admin notification:", adminErr.message);
    }

    // Sync to Zoho (so admin knows it failed)
    try {
      sendLeadToZohoCRM(lead);
    } catch (zohoErr) {
      console.error("❌ Zoho sync failed on failure:", zohoErr.message);
    }

    res.status(200).json({ success: true, message: "Payment status updated to failed" });
  } catch (error) {
    console.error("❌ Error handling payment failure:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


