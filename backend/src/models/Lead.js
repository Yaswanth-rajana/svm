import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    sources: {
      type: [String],
      enum: ["brochure", "webinar", "call_request"],
      default: [],
    },

    // 🔥 Only for webinar users (optional)
    workingProfile: {
      type: String,
      trim: true,
    },

    experience: {
      type: String, // keep string for flexibility ("0-1", "2-5", etc.)
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    eventDate: {
      type: Date,
      default: new Date("2026-05-13T10:00:00+05:30"),
    },
    
    paymentStatus: {
      type: String,
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
    },
    
    razorpayPaymentId: {
      type: String,
    },

    paymentDate: {
      type: Date,
    },

    paymentMethod: {
      type: String,
    },

    transactionId: {
      type: String,
    },

    amountPaid: {
      type: Number,
    },

    reminder7Sent: {
      type: Boolean,
      default: false,
    },
    
    reminder3Sent: {
      type: Boolean,
      default: false,
    },
    
    reminder1Sent: {
      type: Boolean,
      default: false,
    },

    pendingPaymentAlertSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lead", leadSchema);