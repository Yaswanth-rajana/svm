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
    const orderResponse = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1, leadId: leadData._id }), // ₹1 as requested
    });

    const orderData = await orderResponse.json();
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
      handler: async (response) => {
        try {
          // 🔍 Debug: confirm all 3 fields arrive from Razorpay
          console.log("RAZORPAY RESPONSE:", response);
          console.log("razorpay_order_id:", response.razorpay_order_id);
          console.log("razorpay_payment_id:", response.razorpay_payment_id);
          console.log("razorpay_signature:", response.razorpay_signature);
          console.log("leadId:", leadData._id);

          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            leadId: leadData._id
          };
          console.log("VERIFY PAYLOAD SENT:", verifyPayload);

          // 2. Verify payment on backend
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verifyPayload),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onSuccess && onSuccess(verifyData.data);
          } else {
            alert("Payment verification failed. Please contact support.");
            onFailure && onFailure();
          }
        } catch (err) {
          console.error("Verification error:", err);
          alert("An error occurred during verification.");
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
        ondismiss: () => {
          onModalClose && onModalClose();
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  } catch (error) {
    console.error("Payment initialization error:", error);
    onFailure && onFailure();
  }
};
