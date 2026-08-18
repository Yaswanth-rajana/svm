import multer from "multer";
import crypto from "crypto";
import path from "path";
import Course from "../../models/Course.js";
import { uploadFileToR2, deleteFromR2 } from "../../services/r2Service.js";

// Configure multer for PDF uploads with a 50MB file size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

const uploadSingle = upload.single("pdf");

// Helper to run multer as a promise
const runMulter = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadSingle(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Validates the file buffer magic bytes for PDF format.
 * A valid PDF file starts with %PDF- (hex: 25 50 44 46 2d)
 * 
 * @param {Buffer} buffer 
 * @returns {boolean}
 */
function validatePdfSignature(buffer) {
  if (!buffer || buffer.length < 5) return false;
  const limit = Math.min(buffer.length, 1024);
  const fileHead = buffer.toString("ascii", 0, limit);
  return fileHead.includes("%PDF-");
}

/**
 * @desc    Upload course PDF resource
 * @route   POST /api/admin/courses/:id/resources/pdf
 * @access  Private (Admin)
 */
export const uploadPDF = async (req, res) => {
  try {
    const courseId = req.params.id;

    // 1. Verify course exists
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Parse file upload
    try {
      await runMulter(req, res);
    } catch (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds 50MB limit" });
      }
      return res.status(400).json({ success: false, message: err.message || "File upload error" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 3. Verify magic bytes signature
    const isValidSignature = validatePdfSignature(file.buffer);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid PDF file. Only genuine PDF documents are allowed.",
      });
    }

    // 4. Generate unique key
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const key = `courses/${courseId}/resources/pdf/${uniqueId}.pdf`;

    // 5. Upload buffer directly to private R2
    await uploadFileToR2({
      key,
      buffer: file.buffer,
      contentType: "application/pdf",
    });

    // 6. Save metadata to MongoDB
    const allowDownload = req.body.allowDownload !== "false";
    const title = req.body.title || file.originalname.replace(/\.[^/.]+$/, ""); // strip extension
    const newResource = {
      title,
      key,
      fileName: file.originalname,
      size: file.size,
      allowDownload,
    };

    if (!course.resources) {
      course.resources = { pdfs: [] };
    }
    course.resources.pdfs.push(newResource);
    await course.save();

    const addedResource = course.resources.pdfs[course.resources.pdfs.length - 1];

    return res.status(200).json({
      success: true,
      message: "PDF uploaded successfully",
      resource: addedResource,
    });
  } catch (error) {
    console.error("❌ Error in uploadPDF controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error uploading PDF resource",
    });
  }
};

/**
 * @desc    Delete course PDF resource
 * @route   DELETE /api/admin/courses/:id/resources/:resourceId
 * @access  Private (Admin)
 */
export const deletePDF = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { resourceId } = req.params;

    // 1. Find course
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Verify resource exists in course
    if (!course.resources || !course.resources.pdfs) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const resource = course.resources.pdfs.id(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // 3. Delete object from R2 first
    const isDeleted = await deleteFromR2({ key: resource.key });
    if (!isDeleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete PDF from storage. Database record was not modified.",
      });
    }

    // 4. If R2 deletion succeeds, remove the item from MongoDB metadata
    resource.deleteOne();
    await course.save();

    return res.status(200).json({
      success: true,
      message: "PDF resource deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deletePDF controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error deleting PDF resource",
    });
  }
};

/**
 * @desc    Upload lesson PDF resource to R2 (without adding to course resources metadata)
 * @route   POST /api/admin/courses/:id/lessons/upload-pdf
 * @access  Private (Admin)
 */
export const uploadLessonPDF = async (req, res) => {
  try {
    const courseId = req.params.id;

    // 1. Verify course exists
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Parse file upload
    try {
      await runMulter(req, res);
    } catch (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds 50MB limit" });
      }
      return res.status(400).json({ success: false, message: err.message || "File upload error" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 3. Verify magic bytes signature
    const isValidSignature = validatePdfSignature(file.buffer);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid PDF file. Only genuine PDF documents are allowed.",
      });
    }

    // 4. Generate unique key
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const key = `courses/${courseId}/lessons/pdf/${uniqueId}.pdf`;

    // 5. Upload to private R2
    await uploadFileToR2({
      key,
      buffer: file.buffer,
      contentType: "application/pdf",
    });

    return res.status(200).json({
      success: true,
      message: "Lesson PDF uploaded successfully",
      key,
    });
  } catch (error) {
    console.error("❌ Error in uploadLessonPDF controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error uploading lesson PDF",
    });
  }
};

/**
 * @desc    Update course PDF resource metadata (like allowDownload permission)
 * @route   PATCH /api/admin/courses/:id/resources/:resourceId
 * @access  Private (Admin)
 */
export const updatePDFResource = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { resourceId } = req.params;

    // 1. Find course
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Verify resources array is populated
    if (!course.resources || !course.resources.pdfs) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    const resource = course.resources.pdfs.id(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }

    // 3. Update fields
    if (req.body.allowDownload !== undefined) {
      resource.allowDownload = req.body.allowDownload;
    }
    if (req.body.title !== undefined) {
      resource.title = req.body.title;
    }

    await course.save();

    return res.status(200).json({
      success: true,
      message: "PDF resource updated successfully",
      resource,
    });
  } catch (error) {
    console.error("❌ Error in updatePDFResource controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error updating PDF resource",
    });
  }
};
