import Course from "../../models/Course.js";
import { autoEnrollDemoStudent } from "../../utils/demoEnrollment.js";

/**
 * @desc    Update course status
 * @route   PATCH /api/admin/courses/:id/status
 * @access  Private (Admin)
 */
export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["draft", "review", "published", "hidden", "archived"];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const course = await Course.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (status === "published") {
      await autoEnrollDemoStudent(course._id);
    }

    return res.status(200).json({
      success: true,
      message: `Course status updated to ${status}`,
      course
    });
  } catch (error) {
    console.error("❌ Error in updateCourseStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error updating course status"
    });
  }
};
