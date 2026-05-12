import mongoose from "mongoose";
import dotenv from "dotenv";
import Lead from "../models/Lead.js";
import OTP from "../models/OTP.js";
import { normalizePhone } from "./phone.js";

dotenv.config();

const migrate = async () => {
  try {
    console.log("🚀 Starting Phone Number Migration...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Migrate Leads
    const leads = await Lead.find({});
    console.log(`🔍 Found ${leads.length} leads to process.`);

    let leadUpdates = 0;
    for (const lead of leads) {
      const normalized = normalizePhone(lead.phone);
      if (normalized && normalized !== lead.phone) {
        console.log(`📦 Updating lead ${lead.email}: ${lead.phone} -> ${normalized}`);
        lead.phone = normalized;
        await lead.save();
        leadUpdates++;
      }
    }
    console.log(`✅ Lead migration completed. Updated ${leadUpdates} leads.`);

    // 2. Migrate OTPs
    const otps = await OTP.find({});
    console.log(`🔍 Found ${otps.length} OTP records to process.`);

    let otpUpdates = 0;
    for (const otp of otps) {
      if (!otp.contact.includes('@')) {
        const normalized = normalizePhone(otp.contact);
        if (normalized && normalized !== otp.contact) {
          console.log(`📦 Updating OTP for ${otp.contact} -> ${normalized}`);
          otp.contact = normalized;
          await otp.save();
          otpUpdates++;
        }
      }
    }
    console.log(`✅ OTP migration completed. Updated ${otpUpdates} records.`);

    console.log("🏁 Migration finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrate();
