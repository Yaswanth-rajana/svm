import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    contact: {
      type: String,
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['whatsapp', 'email'],
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // auto delete when expired
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

export default mongoose.model("OTP", otpSchema);