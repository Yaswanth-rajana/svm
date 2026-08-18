import Lesson from "../models/Lesson.js";
import Module from "../models/Module.js";
import { syncLessonHierarchy } from "../services/aggregationService.js";
import { processYouTubeMetadata, extractYouTubeVideoId } from "../utils/youtubeHelper.js";
import { triggerLessonPublishedAnnouncement } from "../services/announcementService.js";
import crypto from "crypto";
import { 
  startMultipartUpload, 
  getUploadPartPresignedUrl, 
  completeMultipartUpload, 
  abortMultipartUpload,
  deleteFromR2 
} from "../services/r2Service.js";

/**
 * @desc    Get all active lessons for a specific module
 * @route   GET /api/admin/modules/:moduleId/lessons
 * @access  Private (Admin)
 */
export const getLessonsByModuleId = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc || moduleDoc.deletedAt) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    const lessons = await Lesson.find({ moduleId, deletedAt: null }).sort({ order: 1 });

    return res.status(200).json({ success: true, count: lessons.length, lessons });
  } catch (error) {
    console.error("❌ Error in getLessonsByModuleId:", error);
    return res.status(500).json({ success: false, message: "Server error fetching lessons" });
  }
};

/**
 * @desc    Get single lesson detail by ID
 * @route   GET /api/admin/lessons/:lessonId
 * @access  Private (Admin)
 */
export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findOne({ _id: lessonId, deletedAt: null });

    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    return res.status(200).json({ success: true, lesson });
  } catch (error) {
    console.error("❌ Error in getLessonById:", error);
    return res.status(500).json({ success: false, message: "Server error fetching lesson" });
  }
};

/**
 * @desc    Create a new lesson under a module
 * @route   POST /api/admin/modules/:moduleId/lessons
 * @access  Private (Admin)
 */
export const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      slug,
      shortDescription,
      description,
      lessonType,
      video,
      notes,
      resources,
      settings,
      status,
      visibility,
    } = req.body;

    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc || moduleDoc.deletedAt) {
      return res.status(404).json({ success: false, message: "Parent module not found" });
    }

    const lastLesson = await Lesson.findOne({ moduleId, deletedAt: null }).sort({ order: -1 });
    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    let finalVideo = video;
    if (lessonType === 'video' && video?.provider === 'youtube') {
      const ytId = extractYouTubeVideoId(video.url);
      if (!ytId) {
        return res.status(400).json({ success: false, message: "Invalid YouTube URL format" });
      }
      finalVideo = await processYouTubeMetadata(video.url, video.duration);
      finalVideo.youtubeVideoId = ytId;
    }

    const newLesson = new Lesson({
      moduleId,
      courseId: moduleDoc.courseId,
      title,
      slug,
      shortDescription,
      description,
      lessonType,
      video: finalVideo,
      notes,
      resources,
      settings,
      order: newOrder,
      status,
      visibility,
      createdBy: req.admin?._id,
    });

    await newLesson.save();

    await syncLessonHierarchy(moduleId, moduleDoc.courseId);

    // Non-blocking publication announcement trigger
    if (newLesson.status === 'published') {
      triggerLessonPublishedAnnouncement(newLesson._id).catch(err =>
        console.error("Non-blocking error in triggerLessonPublishedAnnouncement:", err)
      );
    }

    return res.status(201).json({ success: true, message: "Lesson created successfully", lesson: newLesson });
  } catch (error) {
    console.error("❌ Error in createLesson:", error);
    // Handle Mongoose duplicate key error (if slug index is triggered)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A lesson with this slug already exists in this module" });
    }
    return res.status(500).json({ success: false, message: "Server error creating lesson" });
  }
};

/**
 * @desc    Update a lesson
 * @route   PUT /api/admin/lessons/:lessonId
 * @access  Private (Admin)
 */
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.deletedAt) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const wasPublished = lesson.status === 'published';

    // If slug is being updated, verify it's unique within the module
    if (req.body.slug && req.body.slug !== lesson.slug) {
      const existingLesson = await Lesson.findOne({ moduleId: lesson.moduleId, slug: req.body.slug, deletedAt: null });
      if (existingLesson) {
        return res.status(400).json({ success: false, message: "Lesson with this slug already exists in this module" });
      }
    }

    if (req.body.lessonType === 'video' && req.body.video?.provider === 'youtube') {
      const ytId = extractYouTubeVideoId(req.body.video.url);
      if (!ytId) {
        return res.status(400).json({ success: false, message: "Invalid YouTube URL format" });
      }
      req.body.video = await processYouTubeMetadata(req.body.video.url, req.body.video.duration);
      req.body.video.youtubeVideoId = ytId;
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        ...req.body,
        updatedBy: req.admin?._id,
      },
      { returnDocument: 'after', runValidators: true }
    );

    await syncLessonHierarchy(lesson.moduleId, lesson.courseId);

    // Trigger announcement on transition to published
    if (updatedLesson && updatedLesson.status === 'published' && (!wasPublished || req.body.status === 'published')) {
      triggerLessonPublishedAnnouncement(updatedLesson._id).catch(err =>
        console.error("Non-blocking error in triggerLessonPublishedAnnouncement:", err)
      );
    }

    return res.status(200).json({ success: true, message: "Lesson updated successfully", lesson: updatedLesson });
  } catch (error) {
    console.error("❌ Error in updateLesson:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A lesson with this slug already exists in this module" });
    }
    return res.status(500).json({ success: false, message: "Server error updating lesson" });
  }
};

/**
 * @desc    Soft delete a lesson
 * @route   DELETE /api/admin/lessons/:lessonId
 * @access  Private (Admin)
 */
export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.deletedAt) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    lesson.deletedAt = new Date();
    lesson.status = "archived";
    lesson.updatedBy = req.admin?._id;
    await lesson.save();

    await syncLessonHierarchy(lesson.moduleId, lesson.courseId);

    return res.status(200).json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteLesson:", error);
    return res.status(500).json({ success: false, message: "Server error deleting lesson" });
  }
};

/**
 * @desc    Update lesson status (e.g., publish, draft, archive)
 * @route   PATCH /api/admin/lessons/:lessonId/status
 * @access  Private (Admin)
 */
export const updateLessonStatus = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "archived"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.deletedAt) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    lesson.status = status;
    lesson.updatedBy = req.admin?._id;
    await lesson.save();

    await syncLessonHierarchy(lesson.moduleId, lesson.courseId);

    if (lesson.status === 'published') {
      triggerLessonPublishedAnnouncement(lesson._id).catch(err =>
        console.error("Non-blocking error in triggerLessonPublishedAnnouncement:", err)
      );
    }

    return res.status(200).json({ success: true, message: `Lesson status updated to ${status}`, lesson });
  } catch (error) {
    console.error("❌ Error in updateLessonStatus:", error);
    return res.status(500).json({ success: false, message: "Server error updating lesson status" });
  }
};

/**
 * @desc    Reorder lessons (drag & drop)
 * @route   PATCH /api/admin/lessons/reorder
 * @access  Private (Admin)
 */
export const reorderLessons = async (req, res) => {
  try {
    const { updates } = req.body; // Expects an array of { _id, order }

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: "Updates array is required" });
    }

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update._id },
        update: { order: update.order, updatedBy: req.admin?._id },
      },
    }));

    await Lesson.bulkWrite(bulkOps);

    return res.status(200).json({ success: true, message: "Lesson order updated successfully" });
  } catch (error) {
    console.error("❌ Error in reorderLessons:", error);
    return res.status(500).json({ success: false, message: "Server error reordering lessons" });
  }
};

/**
 * @desc    Duplicate a lesson
 * @route   POST /api/admin/lessons/:lessonId/duplicate
 * @access  Private (Admin)
 */
export const duplicateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const originalLesson = await Lesson.findById(lessonId);
    if (!originalLesson || originalLesson.deletedAt) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const lastLesson = await Lesson.findOne({ moduleId: originalLesson.moduleId }).sort("-order");
    const newOrder = lastLesson ? lastLesson.order + 1 : 1;
    
    // Generate a unique slug for the duplicate
    const timestamp = Date.now();
    const newSlug = `${originalLesson.slug}-copy-${timestamp}`;

    const newLesson = new Lesson({
      moduleId: originalLesson.moduleId,
      courseId: originalLesson.courseId,
      title: `${originalLesson.title} (Copy)`,
      slug: newSlug,
      shortDescription: originalLesson.shortDescription,
      description: originalLesson.description,
      lessonType: originalLesson.lessonType,
      video: originalLesson.video,
      notes: originalLesson.notes,
      resources: originalLesson.resources,
      settings: originalLesson.settings,
      order: newOrder,
      status: "draft",
      visibility: "private",
      createdBy: req.admin?._id,
    });

    await newLesson.save();

    await syncLessonHierarchy(originalLesson.moduleId, originalLesson.courseId);

    return res.status(201).json({ success: true, message: "Lesson duplicated successfully", lesson: newLesson });
  } catch (error) {
    console.error("❌ Error in duplicateLesson:", error);
    return res.status(500).json({ success: false, message: "Server error duplicating lesson" });
  }
};

/**
 * @desc    Initialize R2 video multipart upload
 * @route   POST /api/admin/courses/:courseId/lessons/:lessonId/video/upload/init
 * @access  Private (Admin)
 */
export const initializeVideoUpload = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { fileName, fileSize, contentType } = req.body;

    // 1. Verify authenticated admin
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin auth required" });
    }

    // 2. Validate inputs
    if (!fileName || !fileSize || !contentType) {
      return res.status(400).json({ success: false, message: "Missing required file metadata" });
    }

    // Validate size (max 2 GB)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return res.status(400).json({ success: false, message: "File size exceeds the 2 GB limit" });
    }

    // Validate extension
    const ext = fileName.split(".").pop().toLowerCase();
    if (!["mp4", "webm", "mov"].includes(ext)) {
      return res.status(400).json({ success: false, message: "Unsupported file extension. Only MP4, WebM, and MOV are allowed." });
    }

    // Validate MIME type
    if (!["video/mp4", "video/webm", "video/quicktime", "video/mov"].includes(contentType.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Unsupported video content type" });
    }

    // 3. Find lesson and verify it exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.deletedAt) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // 4. Verify lesson belongs to course
    if (lesson.courseId.toString() !== courseId) {
      return res.status(400).json({ success: false, message: "Lesson does not belong to specified course" });
    }

    // 5. Generate secure R2 object key
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const key = `courses/${courseId}/lessons/${lessonId}/video/${uniqueId}.${ext}`;

    // 6. Initiate multipart upload on R2
    const { uploadId } = await startMultipartUpload({ key, contentType });

    return res.status(200).json({
      success: true,
      uploadId,
      key,
    });
  } catch (error) {
    console.error("❌ Error in initializeVideoUpload:", error);
    return res.status(500).json({ success: false, message: "Internal server error initiating video upload" });
  }
};

/**
 * @desc    Get presigned upload URL for a specific part
 * @route   POST /api/admin/courses/:courseId/lessons/:lessonId/video/upload/part
 * @access  Private (Admin)
 */
export const getUploadPartUrl = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { uploadId, key, partNumber, contentType } = req.body;

    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin auth required" });
    }

    if (!uploadId || !key || !partNumber) {
      return res.status(400).json({ success: false, message: "Missing required upload parameters" });
    }

    // Basic route safety check
    if (!key.startsWith(`courses/${courseId}/lessons/${lessonId}/video/`)) {
      return res.status(403).json({ success: false, message: "Access denied: Key does not match lesson path" });
    }

    const url = await getUploadPartPresignedUrl({
      key,
      uploadId,
      partNumber: parseInt(partNumber),
      contentType,
    });

    return res.status(200).json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("❌ Error in getUploadPartUrl:", error);
    return res.status(500).json({ success: false, message: "Internal server error generating part URL" });
  }
};

/**
 * @desc    Complete multipart upload and save metadata to MongoDB
 * @route   POST /api/admin/courses/:courseId/lessons/:lessonId/video/upload/complete
 * @access  Private (Admin)
 */
export const completeVideoUpload = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { uploadId, key, parts, fileName, fileSize, contentType, duration } = req.body;

    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin auth required" });
    }

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      return res.status(400).json({ success: false, message: "Missing upload finalization parameters" });
    }

    // Basic route safety check
    if (!key.startsWith(`courses/${courseId}/lessons/${lessonId}/video/`)) {
      return res.status(403).json({ success: false, message: "Access denied: Key does not match lesson path" });
    }

    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.deletedAt) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    if (lesson.courseId.toString() !== courseId) {
      return res.status(400).json({ success: false, message: "Lesson does not belong to specified course" });
    }

    // Complete R2 multipart upload
    await completeMultipartUpload({ key, uploadId, parts });

    // Store old key for deletion after success
    const oldVideoKey = lesson.video?.videoKey;

    // Update lesson model
    lesson.video = {
      ...lesson.video,
      provider: "r2",
      videoKey: key,
      videoFileName: fileName || lesson.video?.videoFileName || "video.mp4",
      videoSize: fileSize || lesson.video?.videoSize || 0,
      videoMimeType: contentType || lesson.video?.videoMimeType || "video/mp4",
      duration: duration || lesson.video?.duration || 0,
      url: "", // Clear YouTube/direct URL since it's R2 now
    };

    lesson.updatedBy = req.admin?._id;
    await lesson.save();

    await syncLessonHierarchy(lesson.moduleId, lesson.courseId);

    // Delete old video from R2 if it exists and is different from the new key
    if (oldVideoKey && oldVideoKey !== key) {
      await deleteFromR2({ key: oldVideoKey });
    }

    return res.status(200).json({
      success: true,
      message: "Video uploaded and linked successfully",
      video: lesson.video,
    });
  } catch (error) {
    console.error("❌ Error in completeVideoUpload:", error);
    return res.status(500).json({ success: false, message: "Internal server error finalizing video upload" });
  }
};

/**
 * @desc    Abort multipart upload in R2
 * @route   POST /api/admin/courses/:courseId/lessons/:lessonId/video/upload/abort
 * @access  Private (Admin)
 */
export const abortVideoUpload = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { uploadId, key } = req.body;

    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Unauthorized: Admin auth required" });
    }

    if (!uploadId || !key) {
      return res.status(400).json({ success: false, message: "Missing upload parameters" });
    }

    // Basic route safety check
    if (!key.startsWith(`courses/${courseId}/lessons/${lessonId}/video/`)) {
      return res.status(403).json({ success: false, message: "Access denied: Key does not match lesson path" });
    }

    await abortMultipartUpload({ key, uploadId });

    return res.status(200).json({
      success: true,
      message: "Multipart upload aborted successfully",
    });
  } catch (error) {
    console.error("❌ Error in abortVideoUpload:", error);
    return res.status(500).json({ success: false, message: "Internal server error aborting upload" });
  }
};
