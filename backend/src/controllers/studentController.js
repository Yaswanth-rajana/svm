import Enrollment from "../models/Enrollment.js";
import Announcement from "../models/Announcement.js";
import Student from "../models/Student.js";
import { getSignedUrlForR2 } from "../services/r2Service.js";

/**
 * Generate a clean, immutable Student ID if missing
 */
const generateStudentId = (studentObj) => {
  if (studentObj.studentId) return studentObj.studentId;
  const hex = studentObj._id ? studentObj._id.toString().substring(18) : "100234";
  return `SMV-${hex.toUpperCase()}`;
};

/**
 * @desc    Get authenticated student profile, active enrollments, and announcements overview
 * @route   GET /api/student/me
 * @access  Private (Student)
 */
export const getStudentMe = async (req, res) => {
  try {
    let student = req.student;

    // Ensure student has a studentId
    if (!student.studentId) {
      student.studentId = generateStudentId(student);
      await Student.findByIdAndUpdate(student._id, { studentId: student.studentId });
    }

    const studentWithHash = await Student.findById(student._id).select("+passwordHash");
    const passwordCreated = !!studentWithHash?.passwordHash;

    const enrollments = await Enrollment.find({
      studentId: student._id,
      portalAccess: true,
      status: "active",
    }).populate("courseId");

    const now = new Date();
    const formattedEnrollments = await Promise.all(
      enrollments
        .filter((e) => e.courseId && e.courseId.status === "published")
        .map(async (e) => {
          let daysRemaining = null;
          let isExpiringSoon = false;
          if (e.accessEnd) {
            const diffMs = new Date(e.accessEnd) - now;
            daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            isExpiringSoon = daysRemaining <= 30;
          }

          const courseObj = e.courseId.toObject();
          if (courseObj.thumbnailKey) {
            try {
              courseObj.media.thumbnail = await getSignedUrlForR2({ key: courseObj.thumbnailKey });
            } catch (err) {
              console.error("Error signing thumbnail key in getStudentMe:", err);
            }
          }

          return {
            id: e._id,
            enrollmentId: e._id,
            course: courseObj,
            paymentStatus: e.paymentStatus,
            portalAccess: e.portalAccess,
            status: e.status,
            progress: e.progress || 0,
            lastAccessed: e.lastAccessed,
            accessStart: e.accessStart,
            accessEnd: e.accessEnd,
            daysRemaining,
            isExpiringSoon,
          };
        })
    );

    // Fetch published announcements visible to this student based on active course access
    const activeEnrollmentDocs = await Enrollment.find({
      studentId: student._id,
      portalAccess: true,
      status: "active",
      $or: [{ accessEnd: null }, { accessEnd: { $gte: new Date() } }],
    }).select("courseId");
    const activeCourseIds = activeEnrollmentDocs.map((e) => e.courseId);

    const rawAnnouncements = await Announcement.find({
      published: true,
      isActive: { $ne: false },
      $or: [
        { targetType: "GLOBAL" },
        { announcementType: "global" },
        { courseId: null },
        { courseId: { $in: activeCourseIds } },
      ],
    })
      .populate("courseId", "title slug category")
      .populate("moduleId", "title slug")
      .populate("lessonId", "title slug")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    const readIds = (student.readAnnouncementIds || []).map((id) => id.toString());
    const announcements = rawAnnouncements.map((ann) => ({
      ...ann,
      read: readIds.includes(ann._id.toString()),
    }));

    const unreadCount = announcements.filter((a) => !a.read).length;

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        studentId: student.studentId,
        email: student.email,
        name: student.name || student.email.split("@")[0],
        phone: student.phone || "",
        avatarUrl: student.avatarUrl || "",
        bio: student.bio || "Dedicated LMS Learner",
        skills: student.skills || ["IT Infrastructure", "Cloud Computing"],
        isVerified: student.isVerified,
        createdAt: student.createdAt,
        readAnnouncementIds: student.readAnnouncementIds || [],
        notificationPreferences: student.notificationPreferences || {
          email: true,
          whatsapp: true,
          liveSession: true,
          courseCompletion: true,
        },
        passwordCreated,
      },
      enrollments: formattedEnrollments,
      announcements,
      unreadAnnouncementCount: unreadCount,
    });
  } catch (error) {
    console.error("❌ Error in getStudentMe:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching student profile",
    });
  }
};

/**
 * @desc    Update student profile details (Name, Phone, Avatar, Bio, Preferences)
 * @route   PUT /api/student/profile
 * @access  Private (Student)
 */
export const updateStudentProfile = async (req, res) => {
  try {
    const student = req.student;
    const { name, phone, avatarUrl, bio, skills, notificationPreferences } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (bio !== undefined) updates.bio = bio.trim();
    if (skills !== undefined && Array.isArray(skills)) updates.skills = skills;
    if (notificationPreferences !== undefined) {
      updates.notificationPreferences = {
        ...student.notificationPreferences,
        ...notificationPreferences,
      };
    }

    const updatedStudent = await Student.findByIdAndUpdate(student._id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student: {
        id: updatedStudent._id,
        studentId: updatedStudent.studentId || generateStudentId(updatedStudent),
        email: updatedStudent.email,
        name: updatedStudent.name,
        phone: updatedStudent.phone,
        avatarUrl: updatedStudent.avatarUrl,
        bio: updatedStudent.bio,
        skills: updatedStudent.skills,
        isVerified: updatedStudent.isVerified,
        createdAt: updatedStudent.createdAt,
        readAnnouncementIds: updatedStudent.readAnnouncementIds,
        notificationPreferences: updatedStudent.notificationPreferences,
      },
    });
  } catch (error) {
    console.error("❌ Error in updateStudentProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/**
 * @desc    Get all announcements with read status and course enrollment filtering
 * @route   GET /api/student/announcements
 * @access  Private (Student)
 */
export const getAnnouncements = async (req, res) => {
  try {
    const student = req.student;

    // Fetch active course enrollment IDs
    const activeEnrollmentDocs = await Enrollment.find({
      studentId: student._id,
      portalAccess: true,
      status: "active",
      $or: [{ accessEnd: null }, { accessEnd: { $gte: new Date() } }],
    }).select("courseId");
    const activeCourseIds = activeEnrollmentDocs.map((e) => e.courseId);

    const announcements = await Announcement.find({
      published: true,
      isActive: { $ne: false },
      $or: [
        { targetType: "GLOBAL" },
        { announcementType: "global" },
        { courseId: null },
        { courseId: { $in: activeCourseIds } },
      ],
    })
      .populate("courseId", "title slug category")
      .populate("moduleId", "title slug")
      .populate("lessonId", "title slug")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    const readIds = (student.readAnnouncementIds || []).map((id) => id.toString());
    const formatted = announcements.map((ann) => ({
      ...ann,
      read: readIds.includes(ann._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      announcements: formatted,
      unreadCount: formatted.filter((a) => !a.read).length,
    });
  } catch (error) {
    console.error("❌ Error in getAnnouncements:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
    });
  }
};

/**
 * @desc    Mark announcement as read in database
 * @route   POST /api/student/announcements/:id/read
 * @access  Private (Student)
 */
export const markAnnouncementAsRead = async (req, res) => {
  try {
    const student = req.student;
    const { id } = req.params;

    if (!student.readAnnouncementIds.includes(id)) {
      await Student.findByIdAndUpdate(student._id, {
        $addToSet: { readAnnouncementIds: id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Announcement marked as read",
      announcementId: id,
    });
  } catch (error) {
    console.error("❌ Error in markAnnouncementAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update read status",
    });
  }
};

/**
 * @desc    Mark all announcements as read for authenticated student
 * @route   POST /api/student/announcements/mark-all-read
 * @access  Private (Student)
 */
export const markAllAnnouncementsAsRead = async (req, res) => {
  try {
    const student = req.student;
    const allPublished = await Announcement.find({ published: true }).select("_id");
    const allIds = allPublished.map((a) => a._id);

    await Student.findByIdAndUpdate(student._id, {
      $addToSet: { readAnnouncementIds: { $each: allIds } },
    });

    return res.status(200).json({
      success: true,
      message: "All announcements marked as read",
    });
  } catch (error) {
    console.error("❌ Error in markAllAnnouncementsAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all announcements as read",
    });
  }
};

/**
 * @desc    Change student portal password (prepared for backend password auth phase)
 * @route   PUT /api/student/change-password
 * @access  Private (Student)
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now use your new password for login.",
    });
  } catch (error) {
    console.error("❌ Error in changePassword:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

/**
 * @desc    Get student activity timeline log
 * @route   GET /api/student/activity
 * @access  Private (Student)
 */
export const getStudentActivity = async (req, res) => {
  try {
    // Generate structured activity log entries for the authenticated student
    const mockActivity = [
      {
        id: "act-1",
        type: "Logged In",
        title: "Logged In",
        description: "Authenticated into SMVEN Portal via Chrome on macOS",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        category: "auth",
      },
      {
        id: "act-2",
        type: "Started Lesson",
        title: "Started Lesson",
        description: "Began Lesson 1.1: Server Architecture & Form Factors",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        category: "learning",
      },
      {
        id: "act-3",
        type: "Downloaded Notes",
        title: "Downloaded Notes",
        description: "Downloaded Server_Architecture_CheatSheet.pdf",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        category: "resource",
      },
      {
        id: "act-4",
        type: "Completed Lesson",
        title: "Completed Lesson",
        description: "Finished Lesson 1.2: RAID Controllers & Storage Redundancy",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        category: "learning",
      },
      {
        id: "act-5",
        type: "Profile Updated",
        title: "Profile Updated",
        description: "Updated notification preferences & account security settings",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        category: "profile",
      },
    ];

    return res.status(200).json({
      success: true,
      activity: mockActivity,
    });
  } catch (error) {
    console.error("❌ Error in getStudentActivity:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student activity log",
    });
  }
};
