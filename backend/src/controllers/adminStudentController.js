import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";

/**
 * @desc    Get all student enrollments (course access list)
 * @route   GET /api/admin/students/enrollments
 * @access  Private (Admin)
 */
export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("studentId", "email name")
      .populate("courseId", "title category")
      .sort("-createdAt")
      .lean();

    return res.status(200).json({
      success: true,
      enrollments,
    });
  } catch (error) {
    console.error("❌ Error in getEnrollments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error fetching student access list",
    });
  }
};

/**
 * @desc    Grant course access to a student (creates student record if missing)
 * @route   POST /api/admin/students/enroll
 * @access  Private (Admin)
 */
export const enrollStudent = async (req, res) => {
  try {
    const { email, courseId, accessEnd } = req.body;

    if (!email || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Email and Course ID are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 1. Find or create student
    const studentEmail = email.toString().trim().toLowerCase();
    let student = await Student.findOne({ email: studentEmail });
    if (!student) {
      student = await Student.create({
        email: studentEmail,
        name: studentEmail.split("@")[0],
        isVerified: true,
      });
    }

    // 2. Check for existing enrollment
    let enrollment = await Enrollment.findOne({
      studentId: student._id,
      courseId,
    });

    if (enrollment) {
      // Update existing enrollment
      enrollment.portalAccess = true;
      enrollment.status = "active";
      enrollment.accessStart = new Date();
      enrollment.accessEnd = accessEnd ? new Date(accessEnd) : null;
      await enrollment.save();
    } else {
      // Create new enrollment
      enrollment = await Enrollment.create({
        studentId: student._id,
        courseId,
        portalAccess: true,
        status: "active",
        accessStart: new Date(),
        accessEnd: accessEnd ? new Date(accessEnd) : null,
        paymentStatus: "bypassed",
      });
    }

    // Populate enrollment details for the response
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("studentId", "email name")
      .populate("courseId", "title category")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Course access granted successfully",
      enrollment: populatedEnrollment,
    });
  } catch (error) {
    console.error("❌ Error in enrollStudent:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error granting course access",
    });
  }
};

/**
 * @desc    Revoke course access (deletes/revokes enrollment)
 * @route   DELETE /api/admin/students/enrollments/:enrollmentId
 * @access  Private (Admin)
 */
export const revokeAccess = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment record not found",
      });
    }

    // Hard-delete the enrollment to revoke access completely
    await Enrollment.findByIdAndDelete(enrollmentId);

    return res.status(200).json({
      success: true,
      message: "Course access revoked successfully",
    });
  } catch (error) {
    console.error("❌ Error in revokeAccess:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error revoking course access",
    });
  }
};
