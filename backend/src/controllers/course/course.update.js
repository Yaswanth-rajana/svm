import Course from "../../models/Course.js";
import { deleteFromR2 } from "../../services/r2Service.js";

/**
 * @desc    Update course (autosave and manual update)
 * @route   PUT /api/admin/courses/:id
 * @access  Private (Admin)
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating critical fields via generic update
    delete updateData._id;
    delete updateData.deletedAt;
    
    // If slug is being updated, verify uniqueness
    if (updateData.slug) {
      const existingSlug = await Course.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(400).json({ success: false, message: "Slug already exists" });
      }
    }

    // Clean up R2 thumbnail if it was removed/cleared
    if (updateData.media && updateData.media.thumbnail === "") {
      const existingCourse = await Course.findOne({ _id: id, deletedAt: null });
      if (existingCourse && existingCourse.thumbnailKey) {
        // Trigger deletion asynchronously
        deleteFromR2({ key: existingCourse.thumbnailKey }).catch((err) => {
          console.error("⚠️ Failed to delete R2 object on thumbnail removal:", err);
        });
        updateData.thumbnailKey = null;
      }
    }

    const course = await Course.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course
    });
  } catch (error) {
    console.error("❌ Error in updateCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error updating course"
    });
  }
};
