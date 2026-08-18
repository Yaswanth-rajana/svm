import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Uncategorized",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    price: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: "English",
    },
    tags: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    instructor: {
      type: String,
      default: "SMVEN Faculty",
    },
    status: {
      type: String,
      enum: ["draft", "review", "published", "hidden", "archived"],
      default: "draft",
    },
    version: {
      type: String,
      default: "1.0",
    },
    media: {
      thumbnail: { type: String, default: "" },
      banner: { type: String, default: "" },
      previewVideo: { type: String, default: "" },
      previewImage: { type: String, default: "" },
    },
    settings: {
      visibility: { type: String, enum: ["public", "private"], default: "public" },
      comments: { type: Boolean, default: true },
      certificateEnabled: { type: Boolean, default: true },
      dripContent: { type: Boolean, default: false },
      downloadable: { type: Boolean, default: false },
      featured: { type: Boolean, default: false },
      accessType: { type: String, enum: ["lifetime", "expiry"], default: "lifetime" },
      expiryDate: { type: Date, default: null },
      estimatedDuration: { type: String, default: "" },
    },
    stats: {
      modules: { type: Number, default: 0 },
      lessons: { type: Number, default: 0 },
      videos: { type: Number, default: 0 },
      resources: { type: Number, default: 0 },
      assignments: { type: Number, default: 0 },
      quizzes: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 }, // in seconds
      students: { type: Number, default: 0 },
    },
    thumbnailKey: {
      type: String,
      default: null,
    },
    resources: {
      pdfs: {
        type: [
          {
            title: { type: String, required: true },
            key: { type: String, required: true },
            fileName: { type: String, required: true },
            size: { type: Number, required: true },
            allowDownload: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now }
          }
        ],
        default: []
      }
    },
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Assuming an Admin model exists, or omit if not strict
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
