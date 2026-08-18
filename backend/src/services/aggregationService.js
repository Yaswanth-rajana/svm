import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";

/**
 * Recalculates all statistics for a specific module based on its lessons.
 */
const recalculateModule = async (moduleId) => {
  if (!moduleId) return;

  const lessons = await Lesson.find({ moduleId, status: "published", deletedAt: null });

  const stats = {
    lessons: lessons.length,
    videos: 0,
    resources: 0,
    assignments: 0, // Future phase
    quizzes: 0, // Future phase
    totalDuration: 0, // seconds
  };

  lessons.forEach(lesson => {
    if (lesson.lessonType === 'video') stats.videos++;
    if (lesson.video && lesson.video.duration) {
      stats.totalDuration += lesson.video.duration;
    }
    if (lesson.resources && lesson.resources.length > 0) {
      stats.resources += lesson.resources.length;
    }
  });

  await Module.findByIdAndUpdate(moduleId, { stats });
};

/**
 * Recalculates all statistics for a specific course based on its modules.
 */
const recalculateCourse = async (courseId) => {
  if (!courseId) return;

  const modules = await Module.find({ courseId, status: "published", deletedAt: null });

  const stats = {
    modules: modules.length,
    lessons: 0,
    videos: 0,
    resources: 0,
    assignments: 0,
    quizzes: 0,
    totalDuration: 0,
    students: 0, // Keeping this untouched for now or preserving from DB? We should preserve.
  };

  // Preserve students count by fetching current course first
  const course = await Course.findById(courseId);
  if (course && course.stats && course.stats.students) {
    stats.students = course.stats.students;
  }

  modules.forEach(mod => {
    if (mod.stats) {
      stats.lessons += (mod.stats.lessons || 0);
      stats.videos += (mod.stats.videos || 0);
      stats.resources += (mod.stats.resources || 0);
      stats.assignments += (mod.stats.assignments || 0);
      stats.quizzes += (mod.stats.quizzes || 0);
      stats.totalDuration += (mod.stats.totalDuration || 0);
    }
  });

  await Course.findByIdAndUpdate(courseId, { stats });
};

/**
 * Syncs the entire hierarchy (Module -> Course) in one go.
 * Should be called after any mutation that affects lessons or modules.
 */
export const syncLessonHierarchy = async (moduleId, courseId) => {
  try {
    if (moduleId) {
      await recalculateModule(moduleId);
    }
    if (courseId) {
      await recalculateCourse(courseId);
    }
  } catch (error) {
    console.error("❌ Error in syncLessonHierarchy:", error);
  }
};
