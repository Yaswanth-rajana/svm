import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },
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
    shortDescription: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    lessonType: {
      type: String,
      enum: ["video", "text", "resource"],
      default: "video",
    },
    video: {
      provider: {
        type: String,
        enum: ["youtube", "direct", "direct_url", "r2", "cloudflare", "vimeo", ""],
        default: "",
      },
      url: { type: String, default: "" },
      youtubeVideoId: { type: String, default: null },
      title: { type: String, default: null },
      duration: { type: Number, default: 0 }, // in seconds
      thumbnail: { type: String, default: "" },
      embedUrl: { type: String, default: "" },
      videoKey: { type: String, default: "" },
      videoFileName: { type: String, default: "" },
      videoSize: { type: Number, default: 0 },
      videoMimeType: { type: String, default: "" },
      metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    notes: {
      title: { type: String, default: "" },
      content: { type: String, default: "" }, // Markdown or HTML
      pdf: { type: String, default: "" },
      markdown: { type: String, default: "" },
      downloadable: { type: Boolean, default: true },
    },
    resources: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ["pdf", "zip", "link", "github", "image", "doc", "other"], default: "other" },
        url: { type: String, required: true },
        size: { type: Number, default: 0 },
        order: { type: Number, default: 0 },
      },
    ],
    settings: {
      allowPreview: { type: Boolean, default: false },
      sequentialUnlock: { type: Boolean, default: false },
      estimatedTime: { type: Number, default: 0 }, // in minutes
      markCompleteAutomatically: { type: Boolean, default: true },
      requireVideoCompletion: { type: Boolean, default: false },
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
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
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

// Compound index to ensure slug is unique per module
lessonSchema.index({ moduleId: 1, slug: 1 }, { unique: true });

export default mongoose.model("Lesson", lessonSchema);
