import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";
import Enrollment from "../models/Enrollment.js";

/**
 * @desc    Get lesson metadata and notes (no video stream URL in Phase 1.5)
 * @route   GET /api/student/lesson/:lessonId
 * @access  Private (Student)
 */
export const getLessonDetail = async (req, res) => {
  try {
    const student = req.student;
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson || lesson.status !== "published" || lesson.deletedAt) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    if (lesson.courseId) {
      Enrollment.findOneAndUpdate(
        { studentId: student._id, courseId: lesson.courseId },
        { $set: { lastAccessed: new Date() } }
      ).catch((err) => console.warn("Non-blocking lastAccessed sync error in getLessonDetail:", err));
    }

    let progress = await LessonProgress.findOne({
      studentId: student._id,
      lessonId,
    });

    if (!progress) {
      progress = { completed: false, lastPosition: 0 };
    }

    return res.status(200).json({
      success: true,
      lesson: {
        id: lesson._id,
        moduleId: lesson.moduleId,
        courseId: lesson.courseId,
        title: lesson.title,
        slug: lesson.slug,
        shortDescription: lesson.shortDescription,
        description: lesson.description,
        lessonType: lesson.lessonType,
        video: lesson.video ? {
          provider: lesson.video.provider || "",
          duration: lesson.video.duration || 0,
          thumbnail: lesson.video.thumbnail || "",
        } : undefined,
        notes: lesson.notes,
        resources: lesson.resources,
        settings: lesson.settings,
        order: lesson.order,
        progress: {
          completed: progress.completed || false,
          lastPosition: progress.lastPosition || 0,
          highestPosition: progress.highestPosition || 0,
          duration: progress.duration || lesson.video?.duration || lesson.duration || 0,
          progressPercentage: progress.progressPercentage || 0,
          completedAt: progress.completedAt || null,
        },
      },
    });

  } catch (error) {
    console.error("❌ Error in getLessonDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching lesson metadata",
    });
  }
};
