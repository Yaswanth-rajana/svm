import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testEmail = 'yaswanthrajanaindiann@gmail.com';
const testPhone = '919550853516'; // Put user's or a dummy phone number

async function testEmailOTP() {
  const apiKey = process.env.ZEPTO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  console.log("Testing Email with ZEPTO_API_KEY:", apiKey ? "Present" : "Missing");
  console.log("FROM_EMAIL:", fromEmail);

  if (!apiKey || !fromEmail) {
    console.error("Missing config!");
    return;
  }

  const url = 'https://api.zeptomail.in/v1.1/email';
  const data = {
    from: { address: fromEmail, name: "Smart Mate Ventures" },
    to: [{ email_address: { address: testEmail, name: "Test User" } }],
    subject: "Test OTP Verification Code",
    htmlbody: `<div>Your test OTP is: <strong>123456</strong></div>`
  };

  try {
    const res = await axios.post(url, data, {
      headers: {
        'Authorization': `Zoho-enczapikey ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("✅ Email Success:", res.data);
  } catch (err) {
    console.error("❌ Email Error:", err.response ? JSON.stringify(err.response.data) : err.message);
  }
}

async function testWhatsAppOTP() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  console.log("Testing WhatsApp with token:", token ? "Present" : "Missing");
  console.log("PHONE_NUMBER_ID:", phoneNumberId);

  if (!token || !phoneNumberId) {
    console.error("Missing config!");
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: testPhone,
    type: "text",
    text: { body: `Your test OTP is 123456.` }
  };

  try {
    const res = await axios.post(url, data, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    console.log("✅ WhatsApp Success:", res.data);
  } catch (err) {
    console.error("❌ WhatsApp Error:", err.response ? JSON.stringify(err.response.data) : err.message);
  }
}

async function run() {
  console.log("--- Starting Email Test ---");
  await testEmailOTP();
  console.log("\n--- Starting WhatsApp Test ---");
  await testWhatsAppOTP();
}

run();
