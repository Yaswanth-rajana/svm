import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  restoreCourse,
  updateCourseStatus,
  duplicateCourse
} from "../controllers/course/index.js";
import { requireAdminAuth } from "../middleware/adminAuth.js";
import { uploadThumbnail } from "../controllers/course/course.thumbnail.js";
import { uploadPDF, deletePDF, uploadLessonPDF, updatePDFResource } from "../controllers/course/course.resources.js";
import {
  getModulesByCourseId,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  updateModuleStatus,
  reorderModules,
  duplicateModule
} from "../controllers/adminModuleController.js";
import {
  getLessonsByModuleId,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonStatus,
  reorderLessons,
  duplicateLesson,
  initializeVideoUpload,
  getUploadPartUrl,
  completeVideoUpload,
  abortVideoUpload
} from "../controllers/adminLessonController.js";
import {
  getEnrollments,
  enrollStudent,
  resendAccessEmail,
  revokeAccess
} from "../controllers/adminStudentController.js";
import { getDashboardStats } from "../controllers/adminDashboardController.js";

const router = express.Router();

// ==========================
// Dashboard Routes
// ==========================
router.get("/dashboard/stats", requireAdminAuth, getDashboardStats);


const comingSoonHandler = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin API coming soon",
    endpoint: req.originalUrl,
  });
};

// ==========================
// Course Routes
// ==========================
router.post("/courses", createCourse);
router.get("/courses", getCourses);
router.get("/courses/:id", getCourseById);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.post("/courses/:id/restore", restoreCourse);
router.patch("/courses/:id/status", updateCourseStatus);
router.post("/courses/:id/duplicate", duplicateCourse);
router.post("/courses/:id/thumbnail", requireAdminAuth, uploadThumbnail);
router.post("/courses/:id/resources/pdf", requireAdminAuth, uploadPDF);
router.post("/courses/:id/lessons/upload-pdf", requireAdminAuth, uploadLessonPDF);
router.delete("/courses/:id/resources/:resourceId", requireAdminAuth, deletePDF);
router.patch("/courses/:id/resources/:resourceId", requireAdminAuth, updatePDFResource);

// ==========================
// Module Routes
// ==========================
// Note: /reorder must come before /:moduleId to avoid param conflict
router.patch("/modules/reorder", reorderModules);
router.get("/modules/:moduleId", getModuleById);
router.put("/modules/:moduleId", updateModule);
router.delete("/modules/:moduleId", deleteModule);
router.patch("/modules/:moduleId/status", updateModuleStatus);
router.post("/modules/:moduleId/duplicate", duplicateModule);

// Nested course routes for modules
router.get("/courses/:courseId/modules", getModulesByCourseId);
router.post("/courses/:courseId/modules", createModule);

// ==========================
// Lesson Routes (Phase 4)
// ==========================
// Reorder must be before :lessonId to avoid parameter collision
router.patch("/lessons/reorder", reorderLessons);
router.get("/lessons/:lessonId", getLessonById);
router.put("/lessons/:lessonId", updateLesson);
router.delete("/lessons/:lessonId", deleteLesson);
router.patch("/lessons/:lessonId/status", updateLessonStatus);
router.post("/lessons/:lessonId/duplicate", duplicateLesson);

// Lesson R2 video upload routes
router.post("/courses/:courseId/lessons/:lessonId/video/upload/init", requireAdminAuth, initializeVideoUpload);
router.post("/courses/:courseId/lessons/:lessonId/video/upload/part", requireAdminAuth, getUploadPartUrl);
router.post("/courses/:courseId/lessons/:lessonId/video/upload/complete", requireAdminAuth, completeVideoUpload);
router.post("/courses/:courseId/lessons/:lessonId/video/upload/abort", requireAdminAuth, abortVideoUpload);

// Nested module routes for lessons
router.get("/modules/:moduleId/lessons", getLessonsByModuleId);
router.post("/modules/:moduleId/lessons", createLesson);

// ==========================
// Student Routes (Phase 5+)
// ==========================
router.get("/students/enrollments", getEnrollments);
router.post("/students/enroll", enrollStudent);
router.post("/students/resend-access-email", resendAccessEmail);
router.delete("/students/enrollments/:enrollmentId", revokeAccess);

export default router;
