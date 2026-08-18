import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
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
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    lastPosition: {
      type: Number, // in seconds - student's most recent playback position (used for RESUME)
      default: 0,
    },
    highestPosition: {
      type: Number, // in seconds - furthest position ever reached (used for COMPLETION calculation)
      default: 0,
    },
    duration: {
      type: Number, // in seconds
      default: 0,
    },
    progressPercentage: {
      type: Number, // current position / duration * 100
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ studentId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model("LessonProgress", lessonProgressSchema);

