import Course from "../models/Course.js";
import Student from "../models/Student.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import Module from "../models/Module.js";

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private (Admin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Get active (non-deleted) courses
    const activeCourses = await Course.find({ deletedAt: null }).select("_id").lean();
    const activeCourseIds = activeCourses.map(c => c._id);
    const totalCourses = activeCourseIds.length;

    // 2. Get active modules within those active courses
    const activeModules = await Module.find({
      deletedAt: null,
      courseId: { $in: activeCourseIds }
    }).select("_id").lean();
    const activeModuleIds = activeModules.map(m => m._id);

    // 3. Count active lessons within active modules and courses
    const totalLessons = await Lesson.countDocuments({
      deletedAt: null,
      courseId: { $in: activeCourseIds },
      moduleId: { $in: activeModuleIds }
    });

    // 4. Count unique students who have enrollments in these active courses
    const activeStudentIds = await Enrollment.distinct("studentId", {
      courseId: { $in: activeCourseIds }
    });

    const totalStudents = await Student.countDocuments({
      _id: { $in: activeStudentIds }
    });

    return res.status(200).json({
      success: true,
      totalCourses,
      totalStudents,
      totalLessons,
    });
  } catch (error) {
    console.error("❌ Error in getDashboardStats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching dashboard statistics",
    });
  }
};
