import Course from "../../models/Course.js";
import { deleteFromR2, getSignedUrlForR2 } from "../../services/r2Service.js";

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
    
    // If slug is being updated, ensure uniqueness by auto-incrementing if a conflict exists
    if (updateData.slug) {
      let baseSlug = updateData.slug;
      let slug = baseSlug;
      let existingSlug = await Course.findOne({ slug, _id: { $ne: id } });
      let counter = 1;
      while (existingSlug) {
        slug = `${baseSlug}-${counter}`;
        existingSlug = await Course.findOne({ slug, _id: { $ne: id } });
        counter++;
      }
      updateData.slug = slug;
    }

    const existingCourse = await Course.findOne({ _id: id, deletedAt: null });
    if (!existingCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Clean up R2 thumbnail if it was explicitly removed (media.thumbnail === null)
    if (updateData.media && updateData.media.thumbnail === null) {
      if (existingCourse.thumbnailKey) {
        deleteFromR2({ key: existingCourse.thumbnailKey }).catch((err) => {
          console.error("⚠️ Failed to delete R2 object on thumbnail removal:", err);
        });
        updateData.thumbnailKey = null;
        updateData.media.thumbnail = "";
      }
    } else if (updateData.media && (updateData.media.thumbnail === "" || !updateData.media.thumbnail)) {
      // If media.thumbnail is empty string, preserve existing thumbnailKey and signed thumbnail URL
      if (existingCourse.thumbnailKey) {
        delete updateData.media.thumbnail;
      }
    }

    // Clean up empty string expiryDate in settings to avoid Mongoose CastError on Date type
    if (updateData.settings && (updateData.settings.expiryDate === "" || updateData.settings.expiryDate === undefined)) {
      updateData.settings.expiryDate = null;
    }

    const course = await Course.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );

    const courseObj = course.toObject();
    if (courseObj.thumbnailKey) {
      try {
        courseObj.media.thumbnail = await getSignedUrlForR2({ key: courseObj.thumbnailKey });
      } catch (err) {
        console.error("Error signing updated course thumbnail key:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: courseObj
    });
  } catch (error) {
    console.error("❌ Error in updateCourse:", error);
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error updating course"
    });
  }
};
