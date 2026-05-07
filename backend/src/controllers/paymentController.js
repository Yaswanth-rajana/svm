import Razorpay from "razorpay";
import crypto from "crypto";
import Lead from "../models/Lead.js";
import { sendConfirmationEmail, sendRegistrationAdminEmail } from "../services/emailService.js";

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

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/payment/verify
 * @access  Public
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leadId } = req.body;

    // 🔍 Debug logs
    console.log("📥 [Verify] req.body:", req.body);
    console.log("📦 [Verify] razorpay_order_id:", razorpay_order_id);
    console.log("📦 [Verify] razorpay_payment_id:", razorpay_payment_id);
    console.log("📦 [Verify] razorpay_signature:", razorpay_signature);
    console.log("📦 [Verify] leadId:", leadId);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !leadId) {
      console.error("❌ [Verify] Missing fields:", { razorpay_order_id, razorpay_payment_id, razorpay_signature, leadId });
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    // Trim the secret to guard against any trailing whitespace/newline in .env
    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔐 [Verify] Generated signature:", generatedSignature);
    console.log("🔐 [Verify] Received  signature:", razorpay_signature);
    console.log("✅ [Verify] Match:", generatedSignature === razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      // Payment is successful
      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ success: false, message: "Lead not found" });
      }

      // Update lead
      lead.paymentStatus = "paid";
      lead.razorpayOrderId = razorpay_order_id;
      lead.razorpayPaymentId = razorpay_payment_id;
      await lead.save();

      // 🚀 Send email ONLY for webinar (Non-blocking & Fail-safe)
      try {
        console.log(`📩 Webinar email triggered for: ${lead.email}`);
        sendConfirmationEmail({ name: lead.name, email: lead.email });
      } catch (emailErr) {
        console.error("❌ Email trigger failed:", emailErr.message);
      }

      try {
        console.log(`📩 Admin webinar notification triggered for: ${lead.email}`);
        sendRegistrationAdminEmail({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          workingProfile: lead.workingProfile,
          experience: lead.experience,
          paymentStatus: lead.paymentStatus,
        });
      } catch (adminErr) {
        console.error("❌ Admin notification failed:", adminErr.message);
      }

      return res.status(200).json({ success: true, message: "Payment verified successfully", data: lead });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};
