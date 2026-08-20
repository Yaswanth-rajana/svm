import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { sendCourseAccessEmail } from "../services/emailService.js";

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

    // 1. Find or create student (preserve existing password state if existing)
    const studentEmail = email.toString().trim().toLowerCase();
    let student = await Student.findOne({ email: studentEmail });
    if (!student) {
      student = await Student.create({
        email: studentEmail,
        name: studentEmail.split("@")[0],
        isVerified: true,
        passwordSet: false,
        passwordCreated: false,
      });
    }

    // 2. Check for existing enrollment & persist to DB before sending email
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

    // 3. Populate enrollment details for response
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("studentId", "email name")
      .populate("courseId", "title category")
      .lean();

    // 4. Send course access email after successful enrollment persistence
    let emailSent = false;
    try {
      await sendCourseAccessEmail({
        studentEmail: student.email,
        studentName: student.name,
        courseName: course.title,
        courseId: course._id,
        accessTill: enrollment.accessEnd,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("⚠️ Enrollment created, but failed to send access email:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      emailSent,
      message: emailSent
        ? "Course access granted and notification email sent successfully"
        : "Course access granted, but notification email could not be sent",
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
 * @desc    Resend course access email for an existing enrollment
 * @route   POST /api/admin/students/resend-access-email
 * @access  Private (Admin)
 */
export const resendAccessEmail = async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: "Enrollment ID is required",
      });
    }

    // Fetch enrollment and derive student and course details from DB
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("studentId")
      .populate("courseId");

    if (!enrollment || !enrollment.studentId || !enrollment.courseId) {
      return res.status(404).json({
        success: false,
        message: "Active enrollment record not found",
      });
    }

    // Send course access email using backend-derived data
    await sendCourseAccessEmail({
      studentEmail: enrollment.studentId.email,
      studentName: enrollment.studentId.name,
      courseName: enrollment.courseId.title,
      courseId: enrollment.courseId._id,
      accessTill: enrollment.accessEnd,
    });

    return res.status(200).json({
      success: true,
      message: `Course access email resent successfully to ${enrollment.studentId.email}`,
    });
  } catch (error) {
    console.error("❌ Error in resendAccessEmail:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resend course access email",
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
