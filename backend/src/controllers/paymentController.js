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
import { PAYMENT_CONFIG, getPlanPricing } from "../config/paymentConfig.js";

/**
 * Generate a clean, unique receipt identifier for auditing and display.
 */
const generateReceiptNumber = (leadId, installmentNum = 1) => {
  const safeId = String(leadId || "").slice(-6).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `REC-${safeId}-${timestamp}-I${installmentNum}`;
};

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
 * Looks in razorpayOrderId, secondInstallment.razorpayOrderId, and payments history.
 */
const findLeadByOrderId = async (orderId) => {
  const query = {
    $or: [
      { razorpayOrderId: orderId },
      { "secondInstallment.razorpayOrderId": orderId },
      { "payments.orderId": orderId }
    ]
  };
  let lead = await InfrastructureLead.findOne(query);
  if (lead) return { lead, Model: InfrastructureLead };
  lead = await CourseLead.findOne(query);
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

  const isInstallment = lead.paymentPlan === "TWO_INSTALLMENTS";
  const pricing = getPlanPricing(isInstallment ? "TWO_INSTALLMENTS" : "FULL");

  // Update lead details
  lead.paymentStatus = isInstallment ? "PARTIALLY_PAID" : "PAID";
  lead.razorpayOrderId = orderId;
  lead.razorpayPaymentId = paymentId;
  lead.paymentDate = new Date();
  lead.paymentMethod = method || "unknown";
  lead.transactionId = paymentId;
  lead.gstRate = PAYMENT_CONFIG.gstRate;

  if (isInstallment) {
    lead.courseFee = pricing.totalCourseFee; // ₹11,000
    lead.gstAmount = pricing.totalGstAmount; // ₹1,980
    lead.totalAmount = pricing.totalPayable; // ₹12,980
    lead.amountPaid = pricing.firstInstallment.payableAmount; // ₹8,260
    lead.balanceAmount = pricing.secondInstallment.payableAmount; // ₹4,720
    lead.firstInstallmentAmount = pricing.firstInstallment.payableAmount;
    lead.secondInstallmentAmount = pricing.secondInstallment.payableAmount;

    const dueDate = new Date(Date.now() + PAYMENT_CONFIG.installmentDueDays * 24 * 60 * 60 * 1000);
    const receiptNum = generateReceiptNumber(lead._id, 1);

    lead.firstInstallment = {
      amount: pricing.firstInstallment.payableAmount, // ₹8,260
      courseFee: pricing.firstInstallment.courseFee, // ₹7,000
      gstAmount: pricing.firstInstallment.gstAmount, // ₹1,260
      status: "PAID",
      paymentId,
      orderId,
      paidAt: new Date(),
      receiptNumber: receiptNum
    };

    if (!lead.payments) lead.payments = [];
    const alreadyRecorded = lead.payments.some(p => p.paymentId === paymentId);
    if (!alreadyRecorded) {
      lead.payments.push({
        installmentNumber: 1,
        paymentType: "INSTALLMENT_1",
        amount: pricing.firstInstallment.payableAmount,
        courseFee: pricing.firstInstallment.courseFee,
        gstRate: PAYMENT_CONFIG.gstRate,
        gstAmount: pricing.firstInstallment.gstAmount,
        orderId,
        paymentId,
        method: method || "unknown",
        receiptNumber: receiptNum,
        paidAt: new Date()
      });
    }

    // Call Razorpay API to generate second payment link for 472,000 paise (₹4,720.00)
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    try {
      console.log(`🔗 Creating Razorpay Payment Link for second installment of ${lead.email} (472,000 paise)`);
      const linkResponse = await instance.paymentLink.create({
        amount: pricing.secondInstallment.payablePaise, // 472000 paise
        currency: "INR",
        accept_partial: false,
        description: `Second installment payment for ${getProgramConfig(lead.program).shortTitle} Program (Course Fee: ₹4,000 + 18% GST: ₹720)`,
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
        amount: pricing.secondInstallment.payableAmount, // ₹4,720
        courseFee: pricing.secondInstallment.courseFee, // ₹4,000
        gstAmount: pricing.secondInstallment.gstAmount, // ₹720
        status: "PENDING",
        paymentLinkId: linkResponse.id,
        paymentLinkUrl: linkResponse.short_url,
        dueDate: dueDate
      };
    } catch (linkErr) {
      console.error("❌ Failed to create Razorpay Payment Link for second installment:", linkErr.message);
      lead.secondInstallment = {
        amount: pricing.secondInstallment.payableAmount,
        courseFee: pricing.secondInstallment.courseFee,
        gstAmount: pricing.secondInstallment.gstAmount,
        status: "PENDING",
        dueDate: dueDate
      };
    }
  } else {
    // Full Payment
    lead.courseFee = pricing.courseFee; // ₹9,999
    lead.gstAmount = pricing.gstAmount; // ₹1,799.82
    lead.totalAmount = pricing.totalPayable; // ₹11,798.82
    lead.amountPaid = pricing.totalPayable;
    lead.balanceAmount = 0;
    lead.firstInstallmentAmount = pricing.totalPayable;
    lead.secondInstallmentAmount = 0;

    const receiptNum = generateReceiptNumber(lead._id, 1);
    if (!lead.payments) lead.payments = [];
    const alreadyRecorded = lead.payments.some(p => p.paymentId === paymentId);
    if (!alreadyRecorded) {
      lead.payments.push({
        installmentNumber: 1,
        paymentType: "FULL",
        amount: pricing.totalPayable,
        courseFee: pricing.courseFee,
        gstRate: PAYMENT_CONFIG.gstRate,
        gstAmount: pricing.gstAmount,
        orderId,
        paymentId,
        method: method || "unknown",
        receiptNumber: receiptNum,
        paidAt: new Date()
      });
    }
  }

  await lead.save();
  console.log(`✅ [confirmFirstPayment] Lead ${lead.email} payment recorded successfully. Status: ${lead.paymentStatus}`);

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
      lead.biginLastError = undefined;
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
      lead.biginLastError = undefined;
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

  // Send second installment payment link email if partially paid
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
 * Supports finding by paymentLinkId or leadId/orderId.
 */
export const confirmSecondPayment = async ({ paymentLinkId, leadId, leadType, program, orderId, paymentId, method }) => {
  let lead = null;
  if (paymentLinkId) {
    const res = await findLeadByPaymentLinkId(paymentLinkId);
    lead = res.lead;
  } else if (leadId) {
    const res = await getLeadById(leadId, leadType, program);
    lead = res.lead;
  } else if (orderId) {
    const res = await findLeadByOrderId(orderId);
    lead = res.lead;
  }

  if (!lead) {
    console.error(`❌ [confirmSecondPayment] Lead not found for paymentLinkId: ${paymentLinkId}, leadId: ${leadId}`);
    return { lead: null };
  }

  // Ensure first installment was completed
  if (lead.paymentStatus !== "PARTIALLY_PAID" && lead.firstInstallment?.status !== "PAID" && lead.paymentStatus !== "PAID") {
    console.error(`❌ [confirmSecondPayment] First installment is not paid for lead: ${lead.email}`);
    return { lead, error: "First installment not paid" };
  }

  const alreadyProcessed = lead.secondInstallment?.status === "PAID" || (lead.paymentStatus === "PAID" && lead.balanceAmount === 0);
  if (alreadyProcessed) {
    console.log(`ℹ️ [confirmSecondPayment] Lead ${lead.email} second installment already paid. Skipping duplicate execution.`);
    return { lead, alreadyProcessed: true };
  }

  const pricing = getPlanPricing("TWO_INSTALLMENTS");
  const receiptNum = generateReceiptNumber(lead._id, 2);

  // Update lead
  lead.paymentStatus = "PAID";
  lead.secondInstallment = {
    ...(lead.secondInstallment ? (lead.secondInstallment.toObject ? lead.secondInstallment.toObject() : lead.secondInstallment) : {}),
    amount: pricing.secondInstallment.payableAmount, // ₹4,720
    courseFee: pricing.secondInstallment.courseFee, // ₹4,000
    gstAmount: pricing.secondInstallment.gstAmount, // ₹720
    status: "PAID",
    paidAt: new Date(),
    paymentId: paymentId,
    receiptNumber: receiptNum
  };
  if (orderId) {
    lead.secondInstallment.razorpayOrderId = orderId;
  }

  lead.amountPaid = pricing.totalPayable; // ₹12,980
  lead.balanceAmount = 0;

  if (!lead.payments) lead.payments = [];
  const alreadyRecorded = lead.payments.some(p => p.paymentId === paymentId);
  if (!alreadyRecorded) {
    lead.payments.push({
      installmentNumber: 2,
      paymentType: "INSTALLMENT_2",
      amount: pricing.secondInstallment.payableAmount,
      courseFee: pricing.secondInstallment.courseFee,
      gstRate: PAYMENT_CONFIG.gstRate,
      gstAmount: pricing.secondInstallment.gstAmount,
      orderId: orderId || lead.secondInstallment?.paymentLinkId,
      paymentId,
      method: method || "unknown",
      receiptNumber: receiptNum,
      paidAt: new Date()
    });
  }

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
    const { leadId, leadType, program, installmentNumber, installment } = req.body;

    if (!leadId) {
      return res.status(400).json({ success: false, message: "leadId is required" });
    }

    const { lead } = await getLeadById(leadId, leadType, program);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const isSecondInstallment =
      installmentNumber === 2 ||
      installment === "second" ||
      (lead.paymentStatus === "PARTIALLY_PAID" && lead.secondInstallment?.status !== "PAID");

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (isSecondInstallment) {
      // 🛡️ Security Check: Ensure lead is on TWO_INSTALLMENTS plan
      if (lead.paymentPlan !== "TWO_INSTALLMENTS") {
        return res.status(400).json({
          success: false,
          message: "Second installment is only applicable for the 2-Installment payment plan."
        });
      }

      // 🛡️ Security Check: Ensure first installment has succeeded
      if (lead.paymentStatus !== "PARTIALLY_PAID" && lead.firstInstallment?.status !== "PAID") {
        return res.status(400).json({
          success: false,
          message: "First installment must be successfully completed before paying the second installment."
        });
      }

      // 🛡️ Security Check: Ensure second installment is not already paid
      if (lead.secondInstallment?.status === "PAID" || lead.paymentStatus === "PAID") {
        return res.status(400).json({
          success: false,
          message: "Second installment has already been paid."
        });
      }

      const pricing = getPlanPricing("TWO_INSTALLMENTS", 2);
      const amountPaise = pricing.secondInstallment.payablePaise; // 472,000 paise (₹4,720.00)

      const options = {
        amount: amountPaise,
        currency: "INR",
        receipt: `rcpt_${leadId.slice(-8)}_inst2_${Date.now().toString().slice(-4)}`,
        notes: {
          leadId: lead._id.toString(),
          leadType: lead.leadType,
          program: lead.program,
          plan: "TWO_INSTALLMENTS",
          installment: "second",
          installmentNumber: "2"
        }
      };

      const order = await instance.orders.create(options);
      console.log(`📦 [CreateOrder - Second Installment] Created order:`, order.id);

      if (!lead.secondInstallment) lead.secondInstallment = {};
      lead.secondInstallment.razorpayOrderId = order.id;
      await lead.save();

      return res.status(200).json({
        success: true,
        order,
        pricing: {
          courseFee: pricing.secondInstallment.courseFee,
          gstRatePercent: pricing.secondInstallment.gstRatePercent,
          gstAmount: pricing.secondInstallment.gstAmount,
          payableAmount: pricing.secondInstallment.payableAmount,
          installmentNumber: 2
        }
      });
    }

    // 🛡️ First Payment / Full Payment: Prevent duplicate orders if already paid
    if (lead.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "You have already completed the full payment for this program."
      });
    }

    if (lead.paymentStatus === "PARTIALLY_PAID") {
      return res.status(400).json({
        success: false,
        message: "First installment has already been paid. Please pay the remaining second installment."
      });
    }

    // Server-side calculation to prevent tampering
    let amountPaise;
    let pricingBreakdown;

    if (lead.paymentPlan === "TWO_INSTALLMENTS") {
      const pricing = getPlanPricing("TWO_INSTALLMENTS", 1);
      amountPaise = pricing.firstInstallment.payablePaise; // 826,000 paise (₹8,260.00)
      pricingBreakdown = {
        courseFee: pricing.firstInstallment.courseFee,
        gstRatePercent: pricing.firstInstallment.gstRatePercent,
        gstAmount: pricing.firstInstallment.gstAmount,
        payableAmount: pricing.firstInstallment.payableAmount,
        installmentNumber: 1
      };
    } else {
      const pricing = getPlanPricing("FULL");
      amountPaise = pricing.totalPayablePaise; // 1,179,882 paise (₹11,798.82)
      pricingBreakdown = {
        courseFee: pricing.courseFee,
        gstRatePercent: pricing.gstRatePercent,
        gstAmount: pricing.gstAmount,
        payableAmount: pricing.totalPayable,
        installmentNumber: 1
      };
    }

    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${leadId.slice(-8)}_${Date.now().toString().slice(-6)}`,
      notes: {
        leadId: lead._id.toString(),
        leadType: lead.leadType,
        program: lead.program,
        plan: lead.paymentPlan,
        installment: "first"
      }
    };

    const order = await instance.orders.create(options);
    console.log(`📦 [CreateOrder - First/Full] Created order:`, order.id);

    lead.razorpayOrderId = order.id;
    await lead.save();

    return res.status(200).json({
      success: true,
      order,
      pricing: pricingBreakdown
    });
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      leadId,
      leadType,
      program,
      installmentNumber
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !leadId) {
      logger.error("Payment verification failed: Missing parameters");
      return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Razorpay signature verification failed");
      logger.error("Payment verification failed: Invalid signature");
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }

    const { lead } = await getLeadById(leadId, leadType, program);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    let resolvedLeadType = leadType || lead.leadType;
    let resolvedProgram = program || lead.program;

    // Fetch payment details from Razorpay to get method and amount
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

    const isSecondInstallment =
      installmentNumber === 2 ||
      razorpay_order_id === lead.secondInstallment?.razorpayOrderId ||
      paymentDetails.notes?.installment === "second" ||
      paymentDetails.notes?.installmentNumber === "2";

    if (isSecondInstallment) {
      const { lead: updatedLead, alreadyProcessed, error } = await confirmSecondPayment({
        leadId,
        leadType: resolvedLeadType,
        program: resolvedProgram,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        method: paymentDetails.method || "unknown"
      });

      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      logger.info("Second installment payment verification successful");
      return res.status(200).json({
        success: true,
        message: "Second installment verified successfully",
        data: updatedLead,
        alreadyProcessed: Boolean(alreadyProcessed),
        purchase: {
          paymentId: razorpay_payment_id,
          value:
            typeof paymentDetails.amount === "number"
              ? paymentDetails.amount / 100
              : 4720,
          currency: paymentDetails.currency || "INR",
          isFullPaymentComplete: true
        }
      });
    }

    // Process first installment or full payment
    const { lead: updatedLead, alreadyProcessed } = await confirmFirstPayment({
      leadId,
      leadType: resolvedLeadType,
      program: resolvedProgram,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      method: paymentDetails.method || "unknown"
    });

    if (!updatedLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const isFullComplete = updatedLead.paymentStatus === "PAID";
    logger.info("Payment verification successful");

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: updatedLead,
      alreadyProcessed: Boolean(alreadyProcessed),
      purchase: {
        paymentId: razorpay_payment_id,
        value:
          typeof paymentDetails.amount === "number"
            ? paymentDetails.amount / 100
            : Number(updatedLead.amountPaid || 0),
        currency: paymentDetails.currency || "INR",
        isFullPaymentComplete: isFullComplete
      }
    });
  } catch (error) {
    logger.error("Payment verification failed: Exception occurred", error.message);
    console.error("❌ Error verifying Razorpay payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * @desc    Get Detailed Payment Receipt / Invoice Data
 * @route   GET /api/payment/receipt
 * @access  Public
 */
export const getPaymentReceipt = async (req, res) => {
  try {
    const { leadId, paymentId, orderId, paymentLinkId } = req.query;

    let lead = null;
    if (leadId) {
      const result = await getLeadById(leadId);
      lead = result.lead;
    } else if (orderId) {
      const result = await findLeadByOrderId(orderId);
      lead = result.lead;
    } else if (paymentLinkId) {
      const result = await findLeadByPaymentLinkId(paymentLinkId);
      lead = result.lead;
    } else if (paymentId) {
      let l = await InfrastructureLead.findOne({
        $or: [
          { razorpayPaymentId: paymentId },
          { "secondInstallment.paymentId": paymentId },
          { "payments.paymentId": paymentId }
        ]
      });
      if (!l) {
        l = await CourseLead.findOne({
          $or: [
            { razorpayPaymentId: paymentId },
            { "secondInstallment.paymentId": paymentId },
            { "payments.paymentId": paymentId }
          ]
        });
      }
      lead = l;
    }

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "No registration or payment record found."
      });
    }

    const programConfig = getProgramConfig(lead.program);
    const isInstallment = lead.paymentPlan === "TWO_INSTALLMENTS";
    const pricing = getPlanPricing(isInstallment ? "TWO_INSTALLMENTS" : "FULL");

    const receiptData = {
      lead: {
        id: lead._id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        program: lead.program,
        programTitle: programConfig.shortTitle,
        programFullTitle: programConfig.title,
        leadType: lead.leadType
      },
      billing: {
        paymentPlan: lead.paymentPlan,
        paymentStatus: lead.paymentStatus,
        courseFee: lead.courseFee || (isInstallment ? pricing.totalCourseFee : pricing.courseFee),
        gstRate: lead.gstRate || PAYMENT_CONFIG.gstRate,
        gstRatePercent: Math.round((lead.gstRate || PAYMENT_CONFIG.gstRate) * 100),
        gstAmount: lead.gstAmount || (isInstallment ? pricing.totalGstAmount : pricing.gstAmount),
        totalAmount: lead.totalAmount || (isInstallment ? pricing.totalPayable : pricing.totalPayable),
        amountPaid: lead.amountPaid || 0,
        balanceAmount: lead.balanceAmount ?? (lead.totalAmount - lead.amountPaid),
        paymentDate: lead.paymentDate,
        razorpayPaymentId: lead.razorpayPaymentId,
        secondInstallmentDueDate: lead.secondInstallment?.dueDate,
        firstInstallment: lead.firstInstallment || {
          amount: isInstallment ? pricing.firstInstallment.payableAmount : pricing.totalPayable,
          courseFee: isInstallment ? pricing.firstInstallment.courseFee : pricing.courseFee,
          gstAmount: isInstallment ? pricing.firstInstallment.gstAmount : pricing.gstAmount,
          status: lead.amountPaid > 0 ? "PAID" : "PENDING"
        },
        secondInstallment: isInstallment ? {
          amount: pricing.secondInstallment.payableAmount,
          courseFee: pricing.secondInstallment.courseFee,
          gstAmount: pricing.secondInstallment.gstAmount,
          status: lead.secondInstallment?.status || "PENDING",
          dueDate: lead.secondInstallment?.dueDate,
          paymentLinkUrl: lead.secondInstallment?.paymentLinkUrl,
          paidAt: lead.secondInstallment?.paidAt,
          paymentId: lead.secondInstallment?.paymentId
        } : null,
        payments: lead.payments || []
      },
      business: PAYMENT_CONFIG.business
    };

    return res.status(200).json({
      success: true,
      data: receiptData
    });
  } catch (error) {
    console.error("❌ Error fetching payment receipt:", error);
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
        const isSecond =
          orderId === lead.secondInstallment?.razorpayOrderId ||
          paymentEntity.notes?.installment === "second" ||
          paymentEntity.notes?.installmentNumber === "2";

        if (isSecond) {
          console.log(`⚙️ Webhook processing second payment for lead: ${lead.email}`);
          await confirmSecondPayment({
            leadId: lead._id,
            orderId,
            paymentId,
            method
          });
        } else {
          console.log(`⚙️ Webhook processing first payment for lead: ${lead.email}`);
          await confirmFirstPayment({
            leadId: lead._id,
            leadType: lead.leadType,
            program: lead.program,
            orderId,
            paymentId,
            method
          });
        }
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
