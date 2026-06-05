import dotenv from 'dotenv';
import crypto from 'crypto';
import { sendWhatsAppOTP } from './src/services/whatsappService.js';
import { sendEmailOTP } from './src/services/emailService.js';

dotenv.config();

const phone = '9550853516';
const email = 'yaswanthrajanaindiann@gmail.com';
const channel = 'whatsapp';

async function simulate() {
  const formattedPhone = '+91' + phone;
  const primaryChannel = 'whatsapp';
  const otp = '888888';

  let sentChannel = primaryChannel;
  let usedContact = formattedPhone;
  let wasFallback = false;

  console.log("Starting simulation with WhatsApp sending...");
  try {
    if (primaryChannel === 'whatsapp') {
      await sendWhatsAppOTP(formattedPhone, otp);
    } else {
      await sendEmailOTP(email, otp);
    }
  } catch (error) {
    console.warn(`⚠️ Failed to send via ${primaryChannel}. Attempting fallback...`);
    wasFallback = true;
    if (primaryChannel === 'whatsapp' && email) {
      try {
        console.log("Calling sendEmailOTP with email:", email, "otp:", otp);
        await sendEmailOTP(email, otp);
        sentChannel = 'email';
        usedContact = email;
        console.log("Fallback succeeded!");
      } catch (fallbackError) {
        console.error("❌ Fallback to email failed:", fallbackError);
      }
    } else {
      console.log("No fallback criteria met.");
    }
  }

  console.log("Simulation finished. sentChannel =", sentChannel, "wasFallback =", wasFallback);
}

simulate().catch(console.error);
