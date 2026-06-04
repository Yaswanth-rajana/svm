import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5001"),
  MONGO_URI: z.string().url(),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173,https://svm-two.vercel.app").transform((val) => val.split(",")),
  
  // Zoho
  ZOHO_CLIENT_ID: z.string(),
  ZOHO_CLIENT_SECRET: z.string(),
  ZOHO_REFRESH_TOKEN: z.string().optional(),
  ZOHO_REDIRECT_URI: z.string().url(),
  
  // Razorpay
  RAZORPAY_KEY_ID: z.string(),
  RAZORPAY_KEY_SECRET: z.string(),
  
  // WhatsApp (Optional for now)
  PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_TOKEN: z.string().optional(),
  
  // Email
  ZEPTO_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().default("notify@smven.com"),
  ADMIN_EMAIL: z.string().email(),
  DISABLE_OTP_VALIDATION: z.string().default("false"),
});


const envResult = envSchema.safeParse(process.env);

if (!envResult.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(envResult.error.format(), null, 2));
  process.exit(1);
}

export const env = envResult.data;
