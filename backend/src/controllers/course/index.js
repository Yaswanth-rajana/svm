import { createCourse } from "./course.create.js";
import { getCourses, getCourseById } from "./course.get.js";
import { updateCourse } from "./course.update.js";
import { deleteCourse, restoreCourse } from "./course.delete.js";
import { updateCourseStatus } from "./course.status.js";
import { duplicateCourse } from "./course.duplicate.js";

export {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  restoreCourse,
  updateCourseStatus,
  duplicateCourse
};
