import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const otpSchema = new mongoose.Schema({
  contact: String,
  otp: String,
  channel: String,
  attempts: Number,
  isVerified: Boolean,
  expiresAt: Date,
  createdAt: Date
}, { collection: 'otps' });

const OTP = mongoose.model('OTP', otpSchema);

async function check() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Fetching recent 10 OTP records...");
  const records = await OTP.find().sort({ _id: -1 }).limit(10);
  console.log("Recent OTPs:");
  console.log(JSON.stringify(records, null, 2));
  await mongoose.disconnect();
}

check().catch(console.error);
