import axios from 'axios';
import { logger } from './logger';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
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
  onSuccess,
  onFailure,
  onModalClose
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  try {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      onFailure && onFailure();
      return;
    }

    // 1. Create order on backend
    const orderResponse = await axios.post(`${API_URL}/api/payment/create-order`, {
      amount: 1, // ₹1 as requested
      leadId: leadData._id
    });

    const orderData = orderResponse.data;
    if (!orderData.success) {
      alert("Failed to create payment order. Please try again.");
      onFailure && onFailure();
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: "Smart Mate Ventures",
      description: "Webinar Registration",
      order_id: orderData.order.id,
      handler: async function (response) {
        try {
          console.log("Razorpay success handler triggered");
          console.log("Calling verify-payment API");
          
          logger.info("Payment verification started");
          
          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            leadId: leadData._id
          };
          
          logger.info("Calling verification API");

          // 2. Verify payment on backend using axios with 15s timeout
          const verifyRes = await axios.post(
            `${API_URL}/api/payment/verify`,
            verifyPayload,
            { timeout: 15000 }
          );

          const verifyData = verifyRes.data;
          if (verifyData.success) {
            logger.info("Payment verification successful");
            onSuccess && onSuccess(verifyData.data);
          } else {
            logger.error("Payment verification failed");
            alert("Payment verification failed. Please contact support.");
            onFailure && onFailure();
          }
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            console.error("Payment verification timed out after 15 seconds");
            alert("Verification is taking longer than expected. Please do not refresh. If the problem persists, contact support.");
          } else {
            console.error("Payment verification failed:", error);
          }
          logger.error(`Payment verification failed: ${error.message}`);
          onFailure && onFailure();
        }
      },
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: "#ff5a5f" },
      modal: {
        ondismiss: function () {
          console.log("Razorpay modal dismissed");
          onModalClose && onModalClose();
        }
      }
    };

    const paymentObject = new window.Razorpay(options);

    // 3. Add payment failure listener
    paymentObject.on('payment.failed', function (response) {
      console.log("Razorpay payment.failed event triggered");
      console.error("Payment failed details:", response.error);
      // Optional: inform backend about failure
      axios.post(`${API_URL}/api/payment/fail`, {
        leadId: leadData._id,
        razorpay_order_id: response.error.metadata.order_id,
        razorpay_payment_id: response.error.metadata.payment_id,
        error_description: response.error.description
      }).catch(err => console.error("Failed to log payment failure:", err));
    });

    paymentObject.open();
  } catch (error) {
    console.error("Payment initialization error:", error);
    onFailure && onFailure();
  }
};
