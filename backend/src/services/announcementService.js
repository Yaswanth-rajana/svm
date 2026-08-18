import Announcement from "../models/Announcement.js";
import Module from "../models/Module.js";
import Lesson from "../models/Lesson.js";

/**
 * Trigger course-scoped announcement when a module is published
 * Idempotent: Ensures only one announcement is created per published module.
 */
export const triggerModulePublishedAnnouncement = async (moduleId) => {
  try {
    if (!moduleId) return null;

    // 1. Fetch Module with populated Course details
    const module = await Module.findById(moduleId).populate("courseId");
    if (!module || module.status !== "published" || module.deletedAt) {
      return null;
    }

    const course = module.courseId;
    if (!course || course.deletedAt) {
      return null;
    }

    // 2. Check if announcement already exists (application-level check)
    const existing = await Announcement.findOne({
      type: "COURSE_MODULE_PUBLISHED",
      moduleId: module._id,
    });

    if (existing) {
      return existing;
    }

    // 3. Create single course-scoped announcement
    const announcement = await Announcement.create({
      type: "COURSE_MODULE_PUBLISHED",
      targetType: "COURSE",
      announcementType: "course",
      category: "Course Update",
      courseId: course._id,
      moduleId: module._id,
      title: "📚 NEW MODULE AVAILABLE",
      message: `A new module "${module.title}" has been published in your course.`,
      published: true,
      isActive: true,
      publishedAt: new Date(),
      postedBy: "SMVEN System",
    });

    return announcement;
  } catch (error) {
    // Duplicate key error code E11000 means an announcement already exists from race condition
    if (error.code === 11000) {
      console.log(`ℹ️ Module announcement already exists for moduleId: ${moduleId}`);
      return await Announcement.findOne({ type: "COURSE_MODULE_PUBLISHED", moduleId });
    }
    console.error("❌ Non-blocking error creating module publication announcement:", error.message);
    return null;
  }
};

/**
 * Trigger course-scoped announcement when a lesson is published
 * Idempotent: Ensures only one announcement is created per published lesson.
 */
export const triggerLessonPublishedAnnouncement = async (lessonId) => {
  try {
    if (!lessonId) return null;

    // 1. Fetch Lesson with populated Course and Module details
    const lesson = await Lesson.findById(lessonId).populate("courseId").populate("moduleId");
    if (!lesson || lesson.status !== "published" || lesson.deletedAt) {
      return null;
    }

    const course = lesson.courseId;
    const module = lesson.moduleId;
    if (!course || course.deletedAt) {
      return null;
    }

    // 2. Check if announcement already exists (application-level check)
    const existing = await Announcement.findOne({
      type: "COURSE_LESSON_PUBLISHED",
      lessonId: lesson._id,
    });

    if (existing) {
      return existing;
    }

    const moduleName = module ? module.title : "your module";

    // 3. Create single course-scoped announcement
    const announcement = await Announcement.create({
      type: "COURSE_LESSON_PUBLISHED",
      targetType: "COURSE",
      announcementType: "course",
      category: "Course Update",
      courseId: course._id,
      moduleId: module ? module._id : null,
      lessonId: lesson._id,
      title: "🎓 NEW LESSON AVAILABLE",
      message: `"${lesson.title}" is now available in ${moduleName}.`,
      published: true,
      isActive: true,
      publishedAt: new Date(),
      postedBy: "SMVEN System",
    });

    return announcement;
  } catch (error) {
    if (error.code === 11000) {
      console.log(`ℹ️ Lesson announcement already exists for lessonId: ${lessonId}`);
      return await Announcement.findOne({ type: "COURSE_LESSON_PUBLISHED", lessonId });
    }
    console.error("❌ Non-blocking error creating lesson publication announcement:", error.message);
    return null;
  }
};
