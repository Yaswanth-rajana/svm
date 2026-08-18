import Course from "../../models/Course.js";
import { getSignedUrlForR2 } from "../../services/r2Service.js";

/**
 * @desc    Get courses (with filters, pagination, search)
 * @route   GET /api/admin/courses
 * @access  Private (Admin)
 */
export const getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      status, 
      category, 
      instructor,
      sortBy = "createdAt",
      sortDir = "desc" 
    } = req.query;

    const query = { deletedAt: null };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (instructor) query.instructor = instructor;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sortObj = {};
    sortObj[sortBy] = sortDir === 'asc' ? 1 : -1;

    const courses = await Course.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Sign R2 thumbnail keys if they exist
    for (const course of courses) {
      if (course.thumbnailKey) {
        try {
          course.media.thumbnail = await getSignedUrlForR2({ key: course.thumbnailKey });
        } catch (err) {
          console.error("Error signing course list thumbnail key:", err);
        }
      }
    }

    const total = await Course.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: courses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      courses,
    });
  } catch (error) {
    console.error("❌ Error in getCourses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching courses"
    });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/admin/courses/:id
 * @access  Private (Admin)
 */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findOne({ _id: id, deletedAt: null });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const courseObj = course.toObject();
    if (courseObj.thumbnailKey) {
      try {
        courseObj.media.thumbnail = await getSignedUrlForR2({ key: courseObj.thumbnailKey });
      } catch (err) {
        console.error("Error signing course detail thumbnail key:", err);
      }
    }

    return res.status(200).json({
      success: true,
      course: courseObj
    });
  } catch (error) {
    console.error("❌ Error in getCourseById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching course"
    });
  }
};
