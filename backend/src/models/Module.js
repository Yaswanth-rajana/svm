import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    settings: {
      sequentialUnlock: { type: Boolean, default: false },
      allowPreview: { type: Boolean, default: false },
      thumbnail: { type: String, default: "" },
      banner: { type: String, default: "" },
    },
    stats: {
      lessons: { type: Number, default: 0 },
      videos: { type: Number, default: 0 },
      resources: { type: Number, default: 0 },
      assignments: { type: Number, default: 0 },
      quizzes: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 }, // in seconds
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
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

// Compound index to ensure slug is unique per course
moduleSchema.index({ courseId: 1, slug: 1 }, { unique: true });

export default mongoose.model("Module", moduleSchema);
