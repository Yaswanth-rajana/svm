import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "General",
        "Course Update",
        "Maintenance",
        "Live Session",
        "Assignment",
        "Exam",
        "System",
      ],
      default: "General",
    },
    type: {
      type: String,
      enum: ["MANUAL", "COURSE_MODULE_PUBLISHED", "COURSE_LESSON_PUBLISHED"],
      default: "MANUAL",
      index: true,
    },
    targetType: {
      type: String,
      enum: ["GLOBAL", "COURSE"],
      default: "GLOBAL",
      index: true,
    },
    announcementType: {
      type: String,
      enum: ["global", "course"],
      default: "global",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
      index: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      default: null,
      index: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    postedBy: {
      type: String,
      default: "SMVEN Admin",
    },
    attachments: [
      {
        title: { type: String, required: true },
        fileType: { type: String, enum: ["pdf", "image", "video", "link"], default: "pdf" },
        url: { type: String, required: true },
        size: { type: String, default: "" },
        allowDownload: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

// Database-level partial unique indexes for duplicate publication protection
announcementSchema.index(
  { type: 1, moduleId: 1 },
  { unique: true, partialFilterExpression: { type: "COURSE_MODULE_PUBLISHED", moduleId: { $ne: null } } }
);

announcementSchema.index(
  { type: 1, lessonId: 1 },
  { unique: true, partialFilterExpression: { type: "COURSE_LESSON_PUBLISHED", lessonId: { $ne: null } } }
);

export default mongoose.model("Announcement", announcementSchema);
