import Course from "../../models/Course.js";

/**
 * @desc    Create a new course (initial draft)
 * @route   POST /api/admin/courses
 * @access  Private (Admin)
 */
export const createCourse = async (req, res) => {
  try {
    const { title, type, category } = req.body; // type is from template

    if (!title) {
      return res.status(400).json({ success: false, message: "Course title is required" });
    }

    // Generate initial slug
    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    
    // Ensure slug uniqueness
    let slugExists = await Course.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await Course.findOne({ slug });
      counter++;
    }

    const newCourse = new Course({
      title,
      slug,
      category: category || "Uncategorized",
      status: "draft",
      // default template specific settings can be added here if needed based on `type`
      settings: {
        visibility: "public",
        comments: true,
        certificate: true,
      }
    });

    await newCourse.save();

    return res.status(201).json({
      success: true,
      message: "Course draft created successfully",
      course: newCourse
    });

  } catch (error) {
    console.error("❌ Error in createCourse:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error creating course"
    });
  }
};
