import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { getSignedUrlForR2, checkKeyExistsInR2, ensurePlaceholderPDFExists } from "../services/r2Service.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import { extractYouTubeVideoId } from "../utils/youtubeHelper.js";

/**
 * @desc    Get enrolled courses for student
 * @route   GET /api/student/my-courses
 * @access  Private (Student)
 */
export const getMyCourses = async (req, res) => {
  try {
    const student = req.student;

    const enrollments = await Enrollment.find({
      studentId: student._id,
      portalAccess: true,
      status: "active",
    }).populate("courseId");

    const courses = await Promise.all(
      enrollments
        .filter((e) => e.courseId && e.courseId.status === "published")
        .map(async (e) => {
          const courseObj = e.courseId.toObject();
          if (courseObj.thumbnailKey) {
            try {
              courseObj.media.thumbnail = await getSignedUrlForR2({ key: courseObj.thumbnailKey });
            } catch (err) {
              console.error("Error signing thumbnail key in getMyCourses:", err);
            }
          }
          return {
            enrollmentId: e._id,
            progress: e.progress,
            lastAccessed: e.lastAccessed,
            accessStart: e.accessStart,
            accessEnd: e.accessEnd,
            course: courseObj,
          };
        })
    );

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("❌ Error in getMyCourses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching student courses",
    });
  }
};

/**
 * @desc    Get detailed course breakdown with modules, lessons, and progress
 * @route   GET /api/student/course/:courseId
 * @access  Private (Student with Portal Access)
 */
export const getCourseDetail = async (req, res) => {
  try {
    const student = req.student;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const modules = await Module.find({ courseId, status: "published", deletedAt: null }).sort({ order: 1 }).lean();

    const moduleIds = modules.map((m) => m._id);
    const lessons = await Lesson.find({ moduleId: { $in: moduleIds }, status: "published", deletedAt: null })
      .sort({ order: 1 })
      .lean();

    const lessonIds = lessons.map((l) => l._id);
    const progressRecords = await LessonProgress.find({
      studentId: student._id,
      lessonId: { $in: lessonIds },
    }).lean();

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.lessonId.toString()] = {
        completed: Boolean(p.completed),
        lastPosition: p.lastPosition || 0,
        highestPosition: p.highestPosition || 0,
        duration: p.duration || 0,
        progressPercentage: p.progressPercentage || 0,
        completedAt: p.completedAt || null,
      };
    });

    const modulesWithLessons = modules.map((mod) => {
      const modLessons = lessons
        .filter((l) => l.moduleId.toString() === mod._id.toString())
        .map((l) => ({
          ...l,
          video: l.video ? {
            provider: l.video.provider || "",
            duration: l.video.duration || 0,
            thumbnail: l.video.thumbnail || "",
          } : undefined,
          progress: progressMap[l._id.toString()] || {
            completed: false,
            lastPosition: 0,
            highestPosition: 0,
            duration: l.video?.duration || l.duration || 0,
            progressPercentage: 0,
            completedAt: null,
          },
        }));


      return {
        ...mod,
        lessons: modLessons,
      };
    });

    const enrollment = await Enrollment.findOne({ studentId: student._id, courseId });
    if (enrollment) {
      enrollment.lastAccessed = new Date();
      await enrollment.save();
    }

    const courseObj = course.toObject();
    if (courseObj.thumbnailKey) {
      try {
        courseObj.media.thumbnail = await getSignedUrlForR2({ key: courseObj.thumbnailKey });
      } catch (err) {
        console.error("Error signing thumbnail key in getCourseDetail:", err);
      }
    }

    // Determine access expiry dynamically from enrollment details
    courseObj.accessExpiry = enrollment && enrollment.accessEnd
      ? `Expires: ${new Date(enrollment.accessEnd).toLocaleDateString('en-GB')}`
      : 'Lifetime Access';

    return res.status(200).json({
      success: true,
      course: courseObj,
      progress: enrollment ? enrollment.progress : 0,
      modules: modulesWithLessons,
    });
  } catch (error) {
    console.error("❌ Error in getCourseDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching course details",
    });
  }
};

/**
 * @desc    Get temporary signed thumbnail URL for a course
 * @route   GET /api/student/course/:courseId/thumbnail
 * @access  Private (Student with Portal Access)
 */
export const getCourseThumbnailSignedUrl = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find the course
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify course has a thumbnailKey
    if (!course.thumbnailKey) {
      return res.status(404).json({ success: false, message: "Course does not have a custom thumbnail" });
    }

    // Generate signed URL (expires in 15 minutes / 900 seconds)
    const signedUrl = await getSignedUrlForR2({ key: course.thumbnailKey, expiresIn: 900 });

    return res.status(200).json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error("❌ Error in getCourseThumbnailSignedUrl:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error generating thumbnail URL",
    });
  }
};

/**
 * @desc    Get temporary signed download URL for a course PDF resource
 * @route   GET /api/student/course/:courseId/resources/:resourceId/pdf/download
 * @access  Private (Student with Portal Access)
 */
export const getCoursePDFDownloadUrl = async (req, res) => {
  try {
    const { courseId, resourceId } = req.params;

    // 1. Find the course
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Verify resources array is populated
    if (!course.resources || !course.resources.pdfs) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // 3. Find the specific resource and verify it belongs to this course
    const resource = course.resources.pdfs.id(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found in this course" });
    }

    // 4. Verify download permission (default is true if missing/undefined)
    if (resource.allowDownload === false) {
      return res.status(403).json({
        success: false,
        message: "Download is disabled for this resource",
      });
    }

    // 5. Generate signed URL (expires in 5 minutes / 300 seconds)
    let key = resource.key;
    const exists = await checkKeyExistsInR2(key);
    if (!exists) {
      key = await ensurePlaceholderPDFExists();
    }

    const signedUrl = await getSignedUrlForR2({
      key,
      expiresIn: 300,
      fileName: resource.fileName,
      disposition: "attachment",
    });

    return res.status(200).json({
      success: true,
      url: signedUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("❌ Error in getCoursePDFDownloadUrl:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error generating download URL",
    });
  }
};

/**
 * @desc    Get temporary signed view URL for a course PDF resource
 * @route   GET /api/student/course/:courseId/resources/:resourceId/pdf/view
 * @access  Private (Student with Portal Access)
 */
export const getCoursePDFViewUrl = async (req, res) => {
  try {
    const { courseId, resourceId } = req.params;

    // 1. Find the course
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Verify resources array is populated
    if (!course.resources || !course.resources.pdfs) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // 3. Find the specific resource and verify it belongs to this course
    const resource = course.resources.pdfs.id(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found in this course" });
    }

    // 4. Generate signed URL (expires in 5 minutes / 300 seconds) - always allowed for view
    let key = resource.key;
    const exists = await checkKeyExistsInR2(key);
    if (!exists) {
      key = await ensurePlaceholderPDFExists();
    }

    const signedUrl = await getSignedUrlForR2({
      key,
      expiresIn: 300,
      fileName: resource.fileName,
      disposition: "inline",
    });

    return res.status(200).json({
      success: true,
      url: signedUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("❌ Error in getCoursePDFViewUrl:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error generating view URL",
    });
  }
};

/**
 * @desc    Get temporary signed download URL for lesson notes PDF
 * @route   GET /api/student/course/:courseId/lessons/:lessonId/notes/pdf/download
 * @access  Private (Student with Portal Access)
 */
export const getLessonNotesPDFDownloadUrl = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // 1. Verify lesson exists and belongs to the course
    const lesson = await Lesson.findOne({ _id: lessonId, courseId, deletedAt: null });
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // 2. Verify notes PDF key exists
    if (!lesson.notes || !lesson.notes.pdf) {
      return res.status(404).json({ success: false, message: "Lesson notes PDF not found" });
    }

    // 3. Verify download permission (default true if missing/undefined)
    if (lesson.notes.downloadable === false) {
      return res.status(403).json({
        success: false,
        message: "Download is disabled for this resource",
      });
    }

    // 4. Generate signed URL (expires in 5 minutes / 300 seconds) if it is an R2 key
    let finalUrl = lesson.notes.pdf;
    if (!lesson.notes.pdf.startsWith("http://") && !lesson.notes.pdf.startsWith("https://")) {
      const fileName = `${lesson.notes.title || "Lesson_Notes"}.pdf`;
      let key = lesson.notes.pdf;
      const exists = await checkKeyExistsInR2(key);
      if (!exists) {
        key = await ensurePlaceholderPDFExists();
      }

      finalUrl = await getSignedUrlForR2({
        key,
        expiresIn: 300,
        fileName,
        disposition: "attachment",
      });
    }

    return res.status(200).json({
      success: true,
      url: finalUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("❌ Error in getLessonNotesPDFDownloadUrl:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error generating download URL",
    });
  }
};

/**
 * @desc    Get temporary signed view URL for lesson notes PDF
 * @route   GET /api/student/course/:courseId/lessons/:lessonId/notes/pdf/view
 * @access  Private (Student with Portal Access)
 */
export const getLessonNotesPDFViewUrl = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // 1. Verify lesson exists and belongs to the course
    const lesson = await Lesson.findOne({ _id: lessonId, courseId, deletedAt: null });
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // 2. Verify notes PDF key exists
    if (!lesson.notes || !lesson.notes.pdf) {
      return res.status(404).json({ success: false, message: "Lesson notes PDF not found" });
    }

    // 3. Generate signed URL (expires in 5 minutes / 300 seconds) if it is an R2 key
    let finalUrl = lesson.notes.pdf;
    if (!lesson.notes.pdf.startsWith("http://") && !lesson.notes.pdf.startsWith("https://")) {
      const fileName = `${lesson.notes.title || "Lesson_Notes"}.pdf`;
      let key = lesson.notes.pdf;
      const exists = await checkKeyExistsInR2(key);
      if (!exists) {
        key = await ensurePlaceholderPDFExists();
      }

      finalUrl = await getSignedUrlForR2({
        key,
        expiresIn: 300,
        fileName,
        disposition: "inline",
      });
    }

    return res.status(200).json({
      success: true,
      url: finalUrl,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("❌ Error in getLessonNotesPDFViewUrl:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error generating view URL",
    });
  }
};

/**
 * @desc    Get temporary signed playback URL for lesson video
 * @route   GET /api/student/course/:courseId/lessons/:lessonId/video
 * @access  Private (Student with Portal Access)
 */
export const getLessonVideoPlayUrl = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // 1. Verify lesson exists, is published, and belongs to the course
    const lesson = await Lesson.findOne({ _id: lessonId, courseId, status: "published", deletedAt: null });
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    // 2. Verify video exists
    if (!lesson.video || (!lesson.video.youtubeVideoId && !lesson.video.url && !lesson.video.videoKey)) {
      return res.status(404).json({ success: false, message: "Lesson video not found" });
    }

    // 3. Return video response depending on provider
    if (lesson.video.provider === "youtube") {
      const videoId = lesson.video.youtubeVideoId || extractYouTubeVideoId(lesson.video.url);
      if (!videoId) {
        return res.status(404).json({ success: false, message: "YouTube video ID not found or invalid URL" });
      }
      return res.status(200).json({
        success: true,
        video: {
          provider: "youtube",
          videoId: videoId,
          duration: lesson.video.duration || 0,
        }
      });
    }

    // Fallback/Legacy Direct and R2 Video URLs
    let url = lesson.video.url || "";
    if (lesson.video.provider === "r2" && lesson.video.videoKey) {
      url = await getSignedUrlForR2({
        key: lesson.video.videoKey,
        expiresIn: 300,
        disposition: "inline",
      });
    }

    return res.status(200).json({
      success: true,
      video: {
        provider: lesson.video.provider || "direct_url",
        url: url,
        duration: lesson.video.duration || 0,
      }
    });
  } catch (error) {
    console.error("❌ Error in getLessonVideoPlayUrl:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching video play details",
    });
  }
};

/**
 * @desc    Save/Update lesson progress and calculate completion based on duration bounds
 * @route   PATCH /api/student/course/:courseId/lessons/:lessonId/progress
 * @access  Private (Student with Portal Access)
 */
export const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { lastPosition: rawPosition, duration: rawDuration } = req.body;
    const student = req.student;

    if (rawPosition === undefined || typeof rawPosition !== "number" || isNaN(rawPosition) || rawPosition < 0) {
      return res.status(400).json({ success: false, message: "Invalid or missing lastPosition parameter" });
    }

    // 1. Verify course exists and is published
    const course = await Course.findOne({ _id: courseId, status: "published", deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Verify lesson exists, is published, and belongs to the course
    const lesson = await Lesson.findOne({ _id: lessonId, courseId, status: "published", deletedAt: null });
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Lesson not found or does not belong to course" });
    }

    // 3. Determine trusted duration
    let targetDuration = 0;
    if (lesson.video && typeof lesson.video.duration === "number" && lesson.video.duration > 0) {
      targetDuration = lesson.video.duration;
    } else if (typeof lesson.duration === "number" && lesson.duration > 0) {
      targetDuration = lesson.duration;
    } else if (typeof rawDuration === "number" && !isNaN(rawDuration) && rawDuration > 0) {
      targetDuration = rawDuration;
    }

    if (targetDuration <= 0) {
      return res.status(400).json({ success: false, message: "Invalid or unavailable video duration" });
    }

    // 4. Validate & Clamp lastPosition
    let lastPosition = Math.min(rawPosition, targetDuration);
    lastPosition = Math.max(0, Math.round(lastPosition));
    targetDuration = Math.round(targetDuration);

    const progressPercentage = Math.min(100, Math.max(0, Math.round((lastPosition / targetDuration) * 100)));

    // 5. Inspect existing record to determine transition for completedNow
    const existingProgress = await LessonProgress.findOne({
      studentId: student._id,
      courseId,
      lessonId,
    });

    const wasCompleted = Boolean(existingProgress?.completed);
    const currentHighest = existingProgress?.highestPosition || 0;
    const newHighest = Math.max(currentHighest, lastPosition);
    
    // Completion threshold: highestPosition >= 90% of duration
    const isNowCompleted = wasCompleted || (newHighest >= targetDuration * 0.90);
    const completedNow = !wasCompleted && isNowCompleted;

    // 6. Perform atomic upsert / update
    const updateOps = {
      $set: {
        lastPosition,
        duration: targetDuration,
        progressPercentage,
        lastWatchedAt: new Date(),
        completed: isNowCompleted,
      },
      $max: {
        highestPosition: lastPosition,
      },
      $setOnInsert: {
        studentId: student._id,
        courseId,
        lessonId,
      },
    };

    if (completedNow) {
      updateOps.$set.completedAt = new Date();
    } else {
      updateOps.$setOnInsert.completedAt = null;
    }

    const progress = await LessonProgress.findOneAndUpdate(
      {
        studentId: student._id,
        courseId,
        lessonId,
      },
      updateOps,
      { upsert: true, returnDocument: "after" }
    );


    // 7. Sync overall course progress and lastAccessed to Enrollment asynchronously
    (async () => {
      try {
        const modules = await Module.find({ courseId, status: "published", deletedAt: null }).select("_id");
        const moduleIds = modules.map((m) => m._id);
        const courseLessons = await Lesson.find({ moduleId: { $in: moduleIds }, status: "published", deletedAt: null }).select("_id");
        const totalCount = courseLessons.length;
        const lessonIds = courseLessons.map((l) => l._id);

        if (totalCount > 0) {
          const progressRecords = await LessonProgress.find({
            studentId: student._id,
            lessonId: { $in: lessonIds },
          });

          const totalProgressSum = progressRecords.reduce((sum, p) => sum + (p.progressPercentage || 0), 0);
          const pct = Math.min(100, Math.round(totalProgressSum / totalCount));

          await Enrollment.findOneAndUpdate(
            { studentId: student._id, courseId },
            { $set: { progress: pct, lastAccessed: new Date() } }
          );
        } else {
          await Enrollment.findOneAndUpdate(
            { studentId: student._id, courseId },
            { $set: { lastAccessed: new Date() } }
          );
        }
      } catch (syncErr) {
        console.warn("Non-blocking enrollment sync error in updateLessonProgress:", syncErr);
      }
    })();

    return res.status(200).json({
      success: true,
      data: {
        lessonId: lesson._id,
        lastPosition: progress.lastPosition,
        highestPosition: progress.highestPosition,
        duration: progress.duration,
        progressPercentage: progress.progressPercentage,
        completed: progress.completed,
        completedNow,
      },
    });
  } catch (error) {
    console.error("❌ Error in updateLessonProgress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error saving lesson progress",
    });
  }
};

/**
 * @desc    Get aggregated course progress and lesson-level breakdown
 * @route   GET /api/student/course/:courseId/progress
 * @access  Private (Student with Portal Access)
 */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const student = req.student;

    // 1. Verify course exists and is published
    const course = await Course.findOne({ _id: courseId, status: "published", deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Get all published modules and lessons belonging to the course
    const modules = await Module.find({ courseId, status: "published", deletedAt: null }).sort({ order: 1 }).lean();
    const moduleIds = modules.map((m) => m._id);

    const lessons = await Lesson.find({ moduleId: { $in: moduleIds }, status: "published", deletedAt: null })
      .sort({ order: 1 })
      .lean();

    const totalLessons = lessons.length;
    const lessonIds = lessons.map((l) => l._id);

    // 3. Retrieve student's progress records for the course's lessons
    const progressRecords = await LessonProgress.find({
      studentId: student._id,
      lessonId: { $in: lessonIds },
    }).lean();

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.lessonId.toString()] = p;
    });

    // 4. Construct lesson-level progress breakdown
    const lessonProgressList = lessons.map((lesson) => {
      const p = progressMap[lesson._id.toString()];
      const duration = lesson.video?.duration || lesson.duration || p?.duration || 0;
      return {
        lessonId: lesson._id,
        title: lesson.title,
        lastPosition: p?.lastPosition || 0,
        highestPosition: p?.highestPosition || 0,
        duration: duration,
        progressPercentage: p?.progressPercentage || 0,
        completed: p?.completed || false,
        completedAt: p?.completedAt || null,
      };
    });

    const completedLessons = lessonProgressList.filter((l) => l.completed).length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Backward compatibility: maintain Enrollment.progress cache
    Enrollment.findOneAndUpdate(
      { studentId: student._id, courseId },
      { $set: { progress: percentage } }
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      data: {
        courseId,
        totalLessons,
        completedLessons,
        percentage,
        lessons: lessonProgressList,
      },
    });
  } catch (error) {
    console.error("❌ Error in getCourseProgress:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching course progress",
    });
  }
};

