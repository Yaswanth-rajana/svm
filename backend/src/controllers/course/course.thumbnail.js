import multer from "multer";
import crypto from "crypto";
import path from "path";
import Course from "../../models/Course.js";
import { uploadFileToR2, deleteFromR2 } from "../../services/r2Service.js";

// Configure multer for memory storage with a 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

const uploadSingle = upload.single("thumbnail");

// Helper to run multer as a promise to handle errors cleanly inside the async function
const runMulter = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadSingle(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Validates the file buffer against magic numbers for JPG, PNG, and WebP.
 * 
 * @param {Buffer} buffer 
 * @returns {boolean}
 */
function validateImageSignature(buffer) {
  if (!buffer || buffer.length < 12) return false;
  
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  
  // JPEG signature: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  
  // WebP signature: RIFF at offset 0, WEBP at offset 8
  const isWebp = buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  
  return isPng || isJpeg || isWebp;
}

/**
 * @desc    Upload or replace a course thumbnail
 * @route   POST /api/admin/courses/:id/thumbnail
 * @access  Private (Admin)
 */
export const uploadThumbnail = async (req, res) => {
  try {
    const courseId = req.params.id;

    // 1. Verify that the course exists before reading file data
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 2. Parse file from request using multer
    try {
      await runMulter(req, res);
    } catch (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
      }
      return res.status(400).json({ success: false, message: err.message || "File upload error" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 3. Check image signature / magic numbers (do not trust MIME-type header alone)
    const isValidSignature = validateImageSignature(file.buffer);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG, PNG, and WebP images are allowed.",
      });
    }

    // Additional buffer size verification
    if (file.buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
    }

    // 4. Generate unique object key
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const newKey = `courses/${courseId}/thumbnail/${uniqueName}`;

    // 5. Upload buffer to R2 (keeping it private)
    await uploadFileToR2({
      key: newKey,
      buffer: file.buffer,
      contentType: file.mimetype || "image/jpeg",
    });

    // Save previous key for deletion
    const oldKey = course.thumbnailKey;

    // 6. Update database record with the new R2 key
    course.thumbnailKey = newKey;
    await course.save();

    // 7. Cleanup old R2 object if existed
    if (oldKey) {
      deleteFromR2({ key: oldKey }).catch((cleanupErr) => {
        console.error("⚠️ Failed to delete old thumbnail from R2:", cleanupErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course thumbnail uploaded successfully",
      thumbnailKey: newKey,
    });
  } catch (error) {
    console.error("❌ Error in uploadThumbnail controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error uploading course thumbnail",
    });
  }
};
