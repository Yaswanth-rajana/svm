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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Lead", leadSchema);