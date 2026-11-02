import axios from 'axios';
import { logger } from './logger';
import { trackMetaEvent } from './metaPixel';
import { getApiUrl } from '../config/apiConfig';

// Global error listener
if (typeof window !== 'undefined') {
  window.addEventListener("error", (e) => {
    console.error("Global runtime error:", e.error);
  });
}

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const handleRazorpayPayment = async ({
  leadData,
  formData,
  amount,
  installmentNumber = 1,
  onSuccess,
  onFailure,
  onModalClose
}) => {
  const API_URL = getApiUrl();
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  try {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      onFailure && onFailure();
      return;
    }

    // 1. Create order on backend (Backend calculates exact amount in paise)
    const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
      leadId: leadData?._id || leadData?.id,
      leadType: leadData?.leadType,
      program: leadData?.program,
      installmentNumber
    });

    const orderData = orderResponse.data;
    if (!orderData.success) {
      alert(orderData.message || "Failed to create payment order. Please try again.");
      onFailure && onFailure();
      return;
    }

    const order = orderData.order;

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount, // in paise
      currency: order.currency || "INR",
      name: "Smart Mate Ventures",
      description:
        installmentNumber === 2
          ? "Program Registration - Second Installment"
          : leadData?.paymentPlan === "TWO_INSTALLMENTS"
          ? "Program Registration - First Installment"
          : "Program Registration - Full Payment",
      order_id: order.id,
      handler: async function (response) {
        console.log("Razorpay handler entered:", response);
        try {
          const leadId = leadData?._id || leadData?.id;
          if (!leadId) {
            console.error("leadId is missing");
            return;
          }

          if (
            !response.razorpay_order_id ||
            !response.razorpay_payment_id ||
            !response.razorpay_signature
          ) {
            console.error("Incomplete Razorpay response");
            alert("Incomplete response from Razorpay. Please contact support.");
            return;
          }

          logger.info("Payment verification started");

          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            leadId: leadId,
            leadType: leadData?.leadType,
            program: leadData?.program,
            installmentNumber
          };

          // 2. Verify payment on backend with timeout
          const verifyRes = await axios.post(
            `${API_URL}/api/payment/verify`,
            verifyPayload,
            { timeout: 20000 }
          );

          console.log("Verification response:", verifyRes.data);

          const verifyData = verifyRes.data;
          if (verifyData.success) {
            logger.info("Payment verification successful");

            const purchase = verifyData.purchase;
            const paymentId = purchase?.paymentId || response.razorpay_payment_id;
            const value = Number(purchase?.value || (order.amount ? order.amount / 100 : amount));
            const currency = purchase?.currency || "INR";

            const updatedLead = verifyData.data;

            // Save in session storage for PaymentSuccess receipt page
            try {
              sessionStorage.setItem(
                "smven_last_payment",
                JSON.stringify({
                  leadId: updatedLead?._id || leadId,
                  paymentId,
                  orderId: response.razorpay_order_id,
                  plan: updatedLead?.paymentPlan,
                  status: updatedLead?.paymentStatus,
                  amountPaid: updatedLead?.amountPaid || value,
                  balanceAmount: updatedLead?.balanceAmount || 0,
                  timestamp: new Date().toISOString()
                })
              );
            } catch (storageErr) {
              console.warn("Could not save payment to sessionStorage:", storageErr);
            }

            // Meta Pixel Tracking
            // 🛡️ Rule: Do not fire Purchase when only the first installment is paid.
            // Fire Purchase ONLY after full course fee & GST are collected (paymentStatus === 'PAID')
            const isFullPaid =
              updatedLead?.paymentStatus === "PAID" ||
              purchase?.isFullPaymentComplete === true;

            const storageKey = paymentId ? `smven_meta_purchase_${paymentId}` : null;
            let alreadyTracked = false;

            try {
              alreadyTracked = Boolean(storageKey && window.localStorage.getItem(storageKey));
            } catch (error) {
              console.warn("Could not check Purchase event deduplication:", error);
            }

            if (typeof window.fbq === "function" && paymentId && !alreadyTracked) {
              if (isFullPaid) {
                // Fully Paid -> Fire Purchase event
                trackMetaEvent("Purchase", {
                  content_name: leadData?.program || "it-infrastructure",
                  content_category: "program_registration",
                  value,
                  currency,
                });
                try {
                  window.localStorage.setItem(storageKey, "1");
                } catch (e) {}
              } else {
                // First Installment only -> Track custom event, NOT Purchase
                trackMetaEvent("FirstInstallmentPaid", {
                  content_name: leadData?.program || "it-infrastructure",
                  content_category: "installment_payment",
                  value,
                  currency,
                });
                try {
                  window.localStorage.setItem(storageKey, "1");
                } catch (e) {}
              }
            }

            onSuccess && onSuccess(updatedLead, paymentId);
          } else {
            logger.error("Payment verification failed");
            alert("Payment verification failed. Please contact support.");
            onFailure && onFailure();
          }
        } catch (error) {
          console.error("Handler error during verification:", error);
          if (error.code === 'ECONNABORTED') {
            alert("Verification is taking longer than expected. Please do not refresh. Contact support if the problem persists.");
          } else {
            alert(error.response?.data?.message || "Payment verification failed. Please contact support.");
          }
          logger.error(`Payment verification failed: ${error.message}`);
          onFailure && onFailure();
        }
      },
      prefill: {
        name: formData?.fullName || formData?.name || leadData?.name,
        email: formData?.email || leadData?.email,
        contact: formData?.phone || leadData?.phone,
      },
      theme: { color: "#ff5a5f" },
      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout closed by user");
          window.dispatchEvent(new CustomEvent('payment-modal-status', { detail: { isOpen: false, isActive: false } }));
          onModalClose && onModalClose();
        }
      }
    };

    const paymentObject = new window.Razorpay(options);

    // 3. Add payment failure listener
    paymentObject.on('payment.failed', function (resp) {
      console.error("PAYMENT FAILED EVENT:", resp);
      window.dispatchEvent(new CustomEvent('payment-modal-status', { detail: { isOpen: false, isActive: false } }));
      axios.post(`${API_URL}/api/payment/fail`, {
        leadId: leadData?._id || leadData?.id,
        razorpay_order_id: resp.error?.metadata?.order_id,
        razorpay_payment_id: resp.error?.metadata?.payment_id,
        error_description: resp.error?.description,
        leadType: leadData?.leadType,
        program: leadData?.program
      }).catch(err => console.error("Failed to log payment failure:", err));
      onFailure && onFailure(resp.error);
    });

    const amountInRupees = order.amount ? order.amount / 100 : (amount || 9999);
    trackMetaEvent("InitiateCheckout", {
      content_name: leadData?.program || "it-infrastructure",
      currency: "INR",
      value: amountInRupees,
    });

    window.dispatchEvent(new CustomEvent('payment-modal-status', { detail: { isOpen: true, isActive: true } }));
    paymentObject.open();
  } catch (error) {
    console.error("Payment initialization error:", error);
    alert(error.response?.data?.message || error.message || "Failed to initialize payment.");
    onFailure && onFailure();
  }
};
