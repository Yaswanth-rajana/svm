import Razorpay from "razorpay";
import crypto from "crypto";
import InfrastructureLead from "../models/InfrastructureLead.js";
import CourseLead from "../models/CourseLead.js";
import getLeadModel from "../utils/getLeadModel.js";
import { getProgramConfig } from "../config/programConfig.js";
import {
  sendConfirmationEmail,
  sendRegistrationAdminEmail,
  sendFailedPaymentAdminEmail,
  sendSecondInstallmentLinkEmail,
  sendSecondInstallmentPaidEmail
} from "../services/emailService.js";
import { sendLeadToZohoCRM } from "../services/zohoService.js";
import { maskEmail, logger } from "../utils/logger.js";
import {
  createRegistrationInBigin,
  updatePaymentStatus,
  updateRegistrationStage,
  updateBiginRecord
} from "../services/biginService.js";
import { PAYMENT_CONFIG } from "../config/paymentConfig.js";

/**
 * Helper to retrieve a lead document and its corresponding Model class.
 */
const getLeadById = async (leadId, leadType, program) => {
  if (leadType) {
    const Model = leadType === "infrastructure" ? InfrastructureLead : CourseLead;
    const lead = await Model.findById(leadId);
    if (lead) return { lead, Model };
  }
  if (program) {
    const Model = getLeadModel(program);
    const lead = await Model.findById(leadId);
    if (lead) return { lead, Model };
  }
  // Fallback: look up in both collections
  let lead = await InfrastructureLead.findById(leadId);
  if (lead) return { lead, Model: InfrastructureLead };
  lead = await CourseLead.findById(leadId);
  if (lead) return { lead, Model: CourseLead };
  return { lead: null, Model: null };
};

/**
 * Helper to find a lead by Razorpay Order ID.
 */
const findLeadByOrderId = async (orderId) => {
  let lead = await InfrastructureLead.findOne({ razorpayOrderId: orderId });
  if (lead) return { lead, Model: InfrastructureLead };
  lead = await CourseLead.findOne({ razorpayOrderId: orderId });
  if (lead) return { lead, Model: CourseLead };
  return { lead: null, Model: null };
};

/**
 * Helper to find a lead by second installment Payment Link ID.
 */
const findLeadByPaymentLinkId = async (paymentLinkId) => {
  let lead = await InfrastructureLead.findOne({ "secondInstallment.paymentLinkId": paymentLinkId });
  if (lead) return { lead, Model: InfrastructureLead };
  lead = await CourseLead.findOne({ "secondInstallment.paymentLinkId": paymentLinkId });
  if (lead) return { lead, Model: CourseLead };
  return { lead: null, Model: null };
};

/**
 * Shared, idempotent function to process first payment confirmation.
 */
export const confirmFirstPayment = async ({ leadId, leadType, program, orderId, paymentId, method }) => {
  const { lead } = await getLeadById(leadId, leadType, program);
  if (!lead) return { lead: null };

  const alreadyProcessed = ["PAID", "paid", "PARTIALLY_PAID"].includes(lead.paymentStatus);
  if (alreadyProcessed) {
    console.log(`ℹ️ [confirmFirstPayment] Lead ${lead.email} already processed. Skipping duplicate execution.`);
    return { lead, alreadyProcessed: true };
  }

  // Update lead details
  lead.paymentStatus = lead.paymentPlan === "TWO_INSTALLMENTS" ? "PARTIALLY_PAID" : "PAID";
  lead.razorpayOrderId = orderId;
  lead.razorpayPaymentId = paymentId;
  lead.paymentDate = new Date();
  lead.paymentMethod = method || "unknown";
  lead.transactionId = paymentId;

  if (lead.paymentPlan === "TWO_INSTALLMENTS") {
    lead.amountPaid = PAYMENT_CONFIG.firstInstallmentAmount;
    lead.balanceAmount = PAYMENT_CONFIG.secondInstallmentAmount;
    const dueDate = new Date(Date.now() + PAYMENT_CONFIG.installmentDueDays * 24 * 60 * 60 * 1000);

    // Call Razorpay API to generate second payment link
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    try {
      console.log(`🔗 Creating Razorpay Payment Link for second installment of ${lead.email}`);
      const linkResponse = await instance.paymentLink.create({
        amount: PAYMENT_CONFIG.secondInstallmentAmount * 100, // amount in paise
        currency: "INR",
        accept_partial: false,
        description: `Second installment payment for ${getProgramConfig(lead.program).shortTitle} Program`,
        customer: {
          name: lead.name,
          email: lead.email,
          contact: lead.phone
        },
        notify: {
          sms: true,
          email: true
        },
        reminder_enable: true,
        notes: {
          leadId: lead._id.toString(),
          installment: "second"
        },
        callback_url: "https://smven.com/payment-success",
        callback_method: "get"
      });

      lead.secondInstallment = {
        amount: PAYMENT_CONFIG.secondInstallmentAmount,
        status: "PENDING",
        paymentLinkId: linkResponse.id,
        paymentLinkUrl: linkResponse.short_url,
        dueDate: dueDate
      };
    } catch (linkErr) {
      console.error("❌ Failed to create Razorpay Payment Link for second installment:", linkErr.message);
      // Fallback: Store the pending status and try link generation again later if required
      lead.secondInstallment = {
        amount: PAYMENT_CONFIG.secondInstallmentAmount,
        status: "PENDING",
        dueDate: dueDate
      };
    }
  } else {
    lead.amountPaid = PAYMENT_CONFIG.totalAmount;
    lead.balanceAmount = 0;
  }

  await lead.save();
  console.log(`✅ [confirmFirstPayment] Lead ${lead.email} payment details recorded successfully. Status: ${lead.paymentStatus}`);

  // Zoho Bigin Sync
  const biginStatus = lead.paymentStatus === "PAID" ? "Paid" : "Pending";
  const stage = "Enrolled";
  const desc = `Payment Plan: ${lead.paymentPlan}\nPayment Status: ${lead.paymentStatus}\nAmount Paid: ₹${lead.amountPaid}\nBalance: ₹${lead.balanceAmount}`;

  if (lead.biginRecordId) {
    try {
      await updatePaymentStatus(lead.biginRecordId, biginStatus);
      await updateRegistrationStage(lead.biginRecordId, stage);
      await updateBiginRecord(lead.biginRecordId, { Description: desc });
      lead.biginSyncStatus = "synced";
      lead.lastBiginSyncAt = new Date();
      lead.biginLastError = undefined; // clear error
      await lead.save();
    } catch (biginErr) {
      console.error("Bigin Sync Error (confirmFirstPayment update):", biginErr.response?.data || biginErr.message);
      lead.biginSyncStatus = "failed";
      lead.biginLastError = biginErr.message;
      await lead.save();
    }
  } else {
    try {
      console.log(`🔄 Bigin record ID missing for lead ${lead.email}. Creating registration in Bigin first...`);
      const biginId = await createRegistrationInBigin(lead);
      lead.biginRecordId = biginId;
      lead.biginSyncStatus = "synced";
      lead.lastBiginSyncAt = new Date();
      lead.biginLastError = undefined; // clear error
      await lead.save();
    } catch (biginErr) {
      console.error("Bigin Sync Error (confirmFirstPayment create):", biginErr.response?.data || biginErr.message);
      lead.biginSyncStatus = "failed";
      lead.biginLastError = biginErr.message;
      await lead.save();
    }
  }

  // Send registration confirmation emails
  try {
    console.log(`📩 Webinar confirmation email triggered for: ${maskEmail(lead.email)}`);
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

  // Send second installment payment link email
  if (lead.paymentPlan === "TWO_INSTALLMENTS" && lead.secondInstallment?.paymentLinkUrl) {
    try {
      console.log(`📩 Second installment payment link email triggered for: ${maskEmail(lead.email)}`);
      sendSecondInstallmentLinkEmail({
        name: lead.name,
        email: lead.email,
        program: lead.program,
        paymentLinkUrl: lead.secondInstallment.paymentLinkUrl,
        dueDate: lead.secondInstallment.dueDate
      });
    } catch (linkEmailErr) {
      console.error("❌ Second installment link email failed:", linkEmailErr.message);
    }
  }

  // Zoho CRM Sync
  try {
    console.log(`🔄 Syncing lead to Zoho CRM: ${maskEmail(lead.email)}`);
    sendLeadToZohoCRM(lead);
  } catch (zohoErr) {
    console.error("❌ Zoho sync failed:", zohoErr.message);
  }

  return { lead, alreadyProcessed: false };
};

/**
 * Shared, idempotent function to process second payment confirmation.
 */
export const confirmSecondPayment = async ({ paymentLinkId, paymentId }) => {
  const { lead } = await findLeadByPaymentLinkId(paymentLinkId);
  if (!lead) {
    console.error(`❌ [confirmSecondPayment] Lead not found for paymentLinkId: ${paymentLinkId}`);
    return { lead: null };
  }

  const alreadyProcessed = lead.secondInstallment?.status === "PAID" || lead.paymentStatus === "PAID";
  if (alreadyProcessed) {
    console.log(`ℹ️ [confirmSecondPayment] Lead ${lead.email} second installment already paid. Skipping duplicate execution.`);
    return { lead, alreadyProcessed: true };
  }

  // Update lead
  lead.paymentStatus = "PAID";
  lead.secondInstallment.status = "PAID";
  lead.secondInstallment.paidAt = new Date();
  lead.secondInstallment.paymentId = paymentId;
  lead.amountPaid = lead.totalAmount;
  lead.balanceAmount = 0;

  await lead.save();
  console.log(`✅ [confirmSecondPayment] Lead ${lead.email} second installment recorded successfully.`);

  // Zoho Bigin Sync
  const desc = `Payment Plan: ${lead.paymentPlan}\nPayment Status: ${lead.paymentStatus}\nAmount Paid: ₹${lead.amountPaid}\nBalance: ₹${lead.balanceAmount}`;
  if (lead.biginRecordId) {
    try {
      await updatePaymentStatus(lead.biginRecordId, "Paid");
      await updateBiginRecord(lead.biginRecordId, { Description: desc });
    } catch (biginErr) {
      console.error("Bigin Sync Error (confirmSecondPayment):", biginErr.response?.data || biginErr.message);
    }
  }

  // Zoho CRM Sync
  try {
    console.log(`🔄 Syncing lead to Zoho CRM (Second Payment): ${maskEmail(lead.email)}`);
    sendLeadToZohoCRM(lead);
  } catch (zohoErr) {
    console.error("❌ Zoho sync failed:", zohoErr.message);
  }

  // Send full payment confirmation email
  try {
    console.log(`📩 Second installment paid email triggered for: ${maskEmail(lead.email)}`);
    sendSecondInstallmentPaidEmail({
      name: lead.name,
      email: lead.email,
      program: lead.program
    });
  } catch (emailErr) {
    console.error("❌ Second installment paid email failed:", emailErr.message);
  }

  return { lead, alreadyProcessed: false };
};

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Public
 */
export const createOrder = async (req, res) => {
  try {
    const { leadId, leadType, program } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: "leadId is required" });
    }

    const { lead } = await getLeadById(leadId, leadType, program);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Server-side calculation to prevent tampering
    let amountToCharge = PAYMENT_CONFIG.totalAmount;
    if (lead.paymentPlan === "TWO_INSTALLMENTS") {
      amountToCharge = PAYMENT_CONFIG.firstInstallmentAmount;
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    console.log(`🔑 [CreateOrder] Using key_id: ${keyId}`);

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amountToCharge * 100, // paise
      currency: "INR",
      receipt: `rcpt_${leadId.slice(-8)}_${Date.now().toString().slice(-6)}`,
      notes: {
        leadType,
        program
      }
    };

    const order = await instance.orders.create(options);
    console.log(`📦 [CreateOrder] Created order:`, order.id);

    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create order" });
    }

    lead.razorpayOrderId = order.id;
    await lead.save();

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, leadId, leadType, program } = req.body;

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
    console.log("Signature Match:", generatedSignature === razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      let resolvedLeadType = leadType;
      let resolvedProgram = program;

      // Fetch payment details from Razorpay to get method
      let paymentDetails = {};
      try {
        const instance = new Razorpay({
          key_id: (process.env.RAZORPAY_KEY_ID || "").trim(),
          key_secret: secret,
        });
        paymentDetails = await instance.payments.fetch(razorpay_payment_id);
        if (!resolvedLeadType && paymentDetails.notes) {
          resolvedLeadType = paymentDetails.notes.leadType;
          resolvedProgram = paymentDetails.notes.program;
        }
      } catch (payErr) {
        console.error("⚠️ Failed to fetch payment details from Razorpay:", payErr.message);
      }

      // Call shared idempotent helper
      const { lead } = await confirmFirstPayment({
        leadId,
        leadType: resolvedLeadType,
        program: resolvedProgram,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        method: paymentDetails.method || "unknown"
      });

      if (!lead) {
        return res.status(404).json({ success: false, message: "Lead not found" });
      }

      logger.info("Payment verification successful");
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
 * @desc    Handle Razorpay Webhook Events
 * @route   POST /api/payment/webhook
 * @access  Public
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

    if (webhookSecret) {
      if (!signature || !req.rawBody) {
        return res.status(400).json({ success: false, message: "Missing webhook signature or raw body" });
      }
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(req.rawBody)
        .digest("hex");
      if (signature !== expectedSignature) {
        console.error("❌ Webhook signature mismatch");
        return res.status(400).json({ success: false, message: "Invalid webhook signature" });
      }
    }

    const { event, payload } = req.body;
    console.log(`🔔 Received Razorpay Webhook Event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const method = paymentEntity.method;

      const { lead } = await findLeadByOrderId(orderId);
      if (lead) {
        console.log(`⚙️ Webhook processing first payment for lead: ${lead.email}`);
        await confirmFirstPayment({
          leadId: lead._id,
          leadType: lead.leadType,
          program: lead.program,
          orderId,
          paymentId,
          method
        });
      } else {
        console.warn(`⚠️ Lead not found for orderId: ${orderId}`);
      }
    } else if (event === "payment_link.paid") {
      const paymentLinkEntity = payload.payment_link.entity;
      const paymentLinkId = paymentLinkEntity.id;
      const paymentId = payload.payment.entity.id;

      console.log(`⚙️ Webhook processing second payment for link: ${paymentLinkId}`);
      await confirmSecondPayment({
        paymentLinkId,
        paymentId
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Handle Razorpay Payment Failure
 * @route   POST /api/payment/fail
 * @access  Public
 */
export const handlePaymentFailure = async (req, res) => {
  try {
    const { leadId, razorpay_order_id, razorpay_payment_id, error_description, leadType, program } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: "LeadId is required" });
    }

    const { lead } = await getLeadById(leadId, leadType, program);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Update status to failed only if it was pending
    if (lead.paymentStatus === "pending") {
      lead.paymentStatus = "failed";
      if (razorpay_order_id) lead.razorpayOrderId = razorpay_order_id;
      if (razorpay_payment_id) lead.razorpayPaymentId = razorpay_payment_id;
      await lead.save();
    }

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

    // Sync to Zoho
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
