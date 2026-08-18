import Enrollment from "../models/Enrollment.js";

/**
 * Access control middleware for Student Portal course content
 * Verifies that req.student has an active enrollment with portalAccess: true
 */
export const verifyPortalAccess = async (req, res, next) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Student identity missing",
      });
    }

    const courseId = req.params.courseId || req.query.courseId || req.body.courseId;

    // Check enrollment query
    const query = {
      studentId: student._id,
      portalAccess: true,
      status: "active",
    };

    if (courseId) {
      query.courseId = courseId;
    }

    const enrollment = await Enrollment.findOne(query);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Portal access denied: No active enrollment found for this course",
      });
    }

    // Check expiration if set
    if (enrollment.accessEnd && new Date() > new Date(enrollment.accessEnd)) {
      enrollment.status = "expired";
      enrollment.portalAccess = false;
      await enrollment.save();

      return res.status(403).json({
        success: false,
        message: "Portal access expired for this course",
      });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    console.error("❌ Error in verifyPortalAccess middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error verifying portal access",
    });
  }
};
