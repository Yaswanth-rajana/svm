import Student from "../models/Student.js";
import Enrollment from "../models/Enrollment.js";

/**
 * Automatically enrolls the configured demo student to a course when it is published.
 * @param {string} courseId - The ID of the published course
 */
export const autoEnrollDemoStudent = async (courseId) => {
  try {
    const demoEmail = process.env.DEMO_STUDENT_EMAIL;
    if (!demoEmail) {
      console.log("⚠️ DEMO_STUDENT_EMAIL not configured in env, skipping auto-enrollment.");
      return;
    }

    const emailKey = demoEmail.toLowerCase().trim();

    // 1. Find or create the Student record for the demo email
    let student = await Student.findOne({ email: emailKey });
    if (!student) {
      student = await Student.create({
        email: emailKey,
        name: emailKey.split("@")[0],
        isVerified: true,
      });
      console.log(`👤 Created demo student record: ${emailKey} (ID: ${student._id})`);
    } else {
      console.log(`👤 Found existing demo student record: ${emailKey} (ID: ${student._id})`);
    }

    // 2. Check if enrollment already exists for this student and course
    const existingEnrollment = await Enrollment.findOne({
      studentId: student._id,
      courseId,
    });

    if (existingEnrollment) {
      console.log(`ℹ️ Enrollment already exists for demo student ${emailKey} and course ${courseId}`);
      return;
    }

    // 3. Create active enrollment using existing schema
    const newEnrollment = await Enrollment.create({
      studentId: student._id,
      courseId,
      status: "active",
      portalAccess: true,
      paymentStatus: "completed",
      accessStart: new Date(),
      accessEnd: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days access
      progress: 0,
    });

    console.log(`✨ Successfully auto-enrolled demo student ${emailKey} to course ${courseId} (Enrollment ID: ${newEnrollment._id})`);
  } catch (error) {
    console.error("❌ Error in autoEnrollDemoStudent:", error);
  }
};
