import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    readAnnouncementIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],
    notificationPreferences: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      liveSession: { type: Boolean, default: true },
      courseCompletion: { type: Boolean, default: true },
    },
    // Authentication Security Fields
    passwordHash: {
      type: String,
      select: false, // Don't return by default
    },
    passwordCreated: {
      type: Boolean,
      default: false,
    },
    passwordSet: {
      type: Boolean,
      default: false,
    },
    passwordCreatedAt: {
      type: Date,
    },
    lastPasswordChange: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginMethod: {
      type: String,
      enum: ['otp', 'password'],
    },
    rememberMeEnabled: {
      type: Boolean,
      default: false,
    },
    activeSessions: [
      {
        sessionId: { type: String, required: true },
        userAgent: { type: String, default: "" },
        ipAddress: { type: String, default: "" },
        lastActiveAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

studentSchema.pre("save", function () {
  // Sync passwordCreated and passwordSet
  if (this.isModified("passwordCreated")) {
    this.passwordSet = this.passwordCreated;
  } else if (this.isModified("passwordSet")) {
    this.passwordCreated = this.passwordSet;
  }
  
  // Sync isVerified and emailVerified
  if (this.isModified("isVerified")) {
    this.emailVerified = this.isVerified;
  } else if (this.isModified("emailVerified")) {
    this.isVerified = this.emailVerified;
  }
});

export default mongoose.model("Student", studentSchema);
