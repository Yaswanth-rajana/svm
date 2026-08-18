import express from "express";
import { requireStudentAuth } from "../middleware/studentAuth.js";
import { verifyPortalAccess } from "../middleware/portalAccess.js";
import rateLimit from "express-rate-limit";
import {
  getStudentMe,
  updateStudentProfile,
  changePassword,
  getAnnouncements,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead,
  getStudentActivity,
} from "../controllers/studentController.js";
import {
  getMyCourses,
  getCourseDetail,
  getCourseProgress,
  getCourseThumbnailSignedUrl,
  getCoursePDFDownloadUrl,
  getCoursePDFViewUrl,
  getLessonNotesPDFDownloadUrl,
  getLessonNotesPDFViewUrl,
  getLessonVideoPlayUrl,
  updateLessonProgress
} from "../controllers/courseController.js";
import { getModuleDetail } from "../controllers/moduleController.js";
import { getLessonDetail } from "../controllers/lessonController.js";

const router = express.Router();

const videoPlaybackLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many video playback requests, please try again later"
  }
});

// Apply student authentication to all student portal endpoints
router.use(requireStudentAuth);

// GET /api/student/me
router.get("/me", getStudentMe);

// PUT /api/student/profile
router.put("/profile", updateStudentProfile);

// PUT /api/student/change-password
router.put("/change-password", changePassword);

// GET /api/student/announcements
router.get("/announcements", getAnnouncements);

// POST /api/student/announcements/mark-all-read
router.post("/announcements/mark-all-read", markAllAnnouncementsAsRead);

// POST /api/student/announcements/:id/read
router.post("/announcements/:id/read", markAnnouncementAsRead);

// GET /api/student/activity
router.get("/activity", getStudentActivity);

// GET /api/student/my-courses
router.get("/my-courses", getMyCourses);

// GET /api/student/course/:courseId
router.get("/course/:courseId", verifyPortalAccess, getCourseDetail);

// GET /api/student/course/:courseId/progress
router.get("/course/:courseId/progress", verifyPortalAccess, getCourseProgress);

// GET /api/student/course/:courseId/thumbnail
router.get("/course/:courseId/thumbnail", verifyPortalAccess, getCourseThumbnailSignedUrl);

// GET /api/student/course/:courseId/resources/:resourceId/pdf/view
router.get("/course/:courseId/resources/:resourceId/pdf/view", verifyPortalAccess, getCoursePDFViewUrl);

// GET /api/student/course/:courseId/resources/:resourceId/pdf/download
router.get("/course/:courseId/resources/:resourceId/pdf/download", verifyPortalAccess, getCoursePDFDownloadUrl);

// GET /api/student/course/:courseId/lessons/:lessonId/notes/pdf/view
router.get("/course/:courseId/lessons/:lessonId/notes/pdf/view", verifyPortalAccess, getLessonNotesPDFViewUrl);

// GET /api/student/course/:courseId/lessons/:lessonId/notes/pdf/download
router.get("/course/:courseId/lessons/:lessonId/notes/pdf/download", verifyPortalAccess, getLessonNotesPDFDownloadUrl);

// GET /api/student/course/:courseId/lessons/:lessonId/video
router.get("/course/:courseId/lessons/:lessonId/video", videoPlaybackLimiter, verifyPortalAccess, getLessonVideoPlayUrl);

// PATCH /api/student/course/:courseId/lessons/:lessonId/progress
router.patch("/course/:courseId/lessons/:lessonId/progress", verifyPortalAccess, updateLessonProgress);


// GET /api/student/module/:moduleId
router.get("/module/:moduleId", getModuleDetail);

// GET /api/student/lesson/:lessonId
router.get("/lesson/:lessonId", getLessonDetail);

export default router;
