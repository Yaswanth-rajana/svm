import Course from "../../models/Course.js";

/**
 * @desc    Soft delete a course
 * @route   DELETE /api/admin/courses/:id
 * @access  Private (Admin)
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or already deleted" });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deleteCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error deleting course"
    });
  }
};

/**
 * @desc    Restore a soft-deleted course (Undo Delete)
 * @route   POST /api/admin/courses/:id/restore
 * @access  Private (Admin)
 */
export const restoreCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not deleted" });
    }

    return res.status(200).json({
      success: true,
      message: "Course restored successfully",
      course
    });
  } catch (error) {
    console.error("❌ Error in restoreCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error restoring course"
    });
  }
};
