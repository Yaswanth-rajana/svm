import Course from "../../models/Course.js";

/**
 * @desc    Duplicate a course
 * @route   POST /api/admin/courses/:id/duplicate
 * @access  Private (Admin)
 */
export const duplicateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const originalCourse = await Course.findOne({ _id: id, deletedAt: null });

    if (!originalCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const duplicatedData = originalCourse.toObject();
    delete duplicatedData._id;
    delete duplicatedData.createdAt;
    delete duplicatedData.updatedAt;
    
    // Modify title and slug
    duplicatedData.title = `${duplicatedData.title} (Copy)`;
    
    // Generate new unique slug
    let baseSlug = duplicatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let slugExists = await Course.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await Course.findOne({ slug });
      counter++;
    }
    
    duplicatedData.slug = slug;
    duplicatedData.status = "draft"; // Duplicates always start as draft
    duplicatedData.version = "1.0";

    const newCourse = new Course(duplicatedData);
    await newCourse.save();

    return res.status(201).json({
      success: true,
      message: "Course duplicated successfully",
      course: newCourse
    });
  } catch (error) {
    console.error("❌ Error in duplicateCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error duplicating course"
    });
  }
};
