import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "bypassed"],
      default: "completed",
    },
    portalAccess: {
      type: Boolean,
      default: true,
    },
    accessStart: {
      type: Date,
      default: Date.now,
    },
    accessEnd: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "paused", "expired", "revoked"],
      default: "active",
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0, // percentage 0-100
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
  },
  { timestamps: true }
);

// Compound index to ensure unique active enrollment per student per course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
