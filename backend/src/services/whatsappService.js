import axios from "axios";

/**
 * Sends a WhatsApp message containing an OTP using Meta Cloud API.
 * 
 * @param {string} phone - The phone number to send the OTP to.
 * @param {string} otp - The OTP to send.
 * @returns {void}
 */
export const sendWhatsAppOTP = async (phone, otp) => {
  // Ensure phone number format: without "+"
  const formattedPhone = "91" + phone.replace(/\D/g, "").slice(-10);
  
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("⚠️ WhatsApp credentials not configured. Skipping WhatsApp OTP.");
    throw new Error("WhatsApp credentials missing");
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "text",
    text: {
      body: `Your OTP is ${otp}. Do not share it.`
    }
  };

  const config = {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  // Enhanced Debug Logs
  console.log("📤 Sending WhatsApp OTP...");
  console.log("Phone:", formattedPhone);

  try {
    const res = await axios.post(url, data, config);
    console.log("✅ SUCCESS WhatsApp OTP");
    return res.data;
  } catch (err) {
    console.log("❌ ERROR WhatsApp OTP");
    console.log(JSON.stringify(err.response?.data || err.message, null, 2));
    throw err;
  }
};
