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
    },

    sources: {
      type: [String],
      enum: ["brochure", "webinar", "call_request"],
      default: [],
    },

    program: {
      type: String,
      default: "it-infrastructure",
      trim: true,
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
      default: new Date("2026-07-04T10:00:00+05:30"),
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

    reminder30MinSent: {
      type: Boolean,
      default: false,
    },

    pendingPaymentAlertSent: {
      type: Boolean,
      default: false,
    },

    certificateClaimed: {
      type: Boolean,
      default: false
    },

    certificateId: {
      type: String,
      default: ""
    },

    claimedAt: {
      type: Date,
      default: null
    },

    leadType: {
      type: String,
      enum: ["infrastructure", "course"],
      required: true,
    },

    biginRecordId: {
      type: String,
    },

    biginSyncStatus: {
      type: String,
      enum: ["pending", "synced", "failed"],
      default: "pending",
    },

    lastBiginSyncAt: {
      type: Date,
    },

    biginLastError: {
      type: String,
    },

    biginRetryCount: {
      type: Number,
      default: 0,
    },

    lastBiginRetryAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ phone: 1, program: 1 }, { unique: true });
leadSchema.index({ email: 1, program: 1 }, { unique: true });

export { leadSchema };
export default mongoose.model("Lead", leadSchema);