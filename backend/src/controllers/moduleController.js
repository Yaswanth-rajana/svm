import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";

/**
 * @desc    Get module details and published lessons
 * @route   GET /api/student/module/:moduleId
 * @access  Private (Student)
 */
export const getModuleDetail = async (req, res) => {
  try {
    const student = req.student;
    const { moduleId } = req.params;

    const module = await Module.findOne({ _id: moduleId, status: "published", deletedAt: null });
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    const lessons = await Lesson.find({ moduleId, status: "published", deletedAt: null }).sort({ order: 1 }).lean();

    const lessonIds = lessons.map((l) => l._id);
    const progressRecords = await LessonProgress.find({
      studentId: student._id,
      lessonId: { $in: lessonIds },
    }).lean();

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.lessonId.toString()] = {
        completed: p.completed,
        lastPosition: p.lastPosition,
      };
    });

    const lessonsWithProgress = lessons.map((l) => ({
      ...l,
      progress: progressMap[l._id.toString()] || { completed: false, lastPosition: 0 },
    }));

    return res.status(200).json({
      success: true,
      module: {
        ...module.toObject(),
        lessons: lessonsWithProgress,
      },
    });
  } catch (error) {
    console.error("❌ Error in getModuleDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching module details",
    });
  }
};
