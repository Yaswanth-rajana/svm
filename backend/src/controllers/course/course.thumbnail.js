import multer from "multer";
import crypto from "crypto";
import path from "path";
import Course from "../../models/Course.js";
import { uploadFileToR2, deleteFromR2, getSignedUrlForR2 } from "../../services/r2Service.js";

// Configure multer for memory storage with a strict 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit strictly enforced by Multer
  },
});

// Middleware for parsing multipart form data with field name "thumbnail"
export const uploadThumbnailMiddleware = (req, res, next) => {
  upload.single("thumbnail")(req, res, (err) => {
    console.log("=== MULTER MIDDLEWARE EXECUTED ===");
    console.log("req.file after multer:", req.file);
    console.log("=================================");
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
      }
      return res.status(400).json({ success: false, message: err.message || "File upload error" });
    }
    next();
  });
};

/**
 * Validates the file buffer magic bytes for JPEG, PNG, and WebP format strictly.
 * 
 * @param {Buffer} buffer 
 * @param {string} mimetype 
 * @returns {boolean}
 */
function validateImageSignature(buffer, mimetype = "") {
  if (!buffer || buffer.length < 12) return false;
  
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  
  // JPEG signature: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  
  // WebP signature: RIFF at offset 0, WEBP at offset 8
  const isWebp = buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

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

    console.log("=== THUMBNAIL DEBUG ===");
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    console.log("content-type:", req.headers["content-type"]);
    console.log("=======================");

    // 1. Check if req.file is populated by Multer middleware
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "Thumbnail file is required" });
    }

    // 2. Verify that the course exists
    const course = await Course.findOne({ _id: courseId, deletedAt: null });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // 3. Strict buffer magic-byte validation (JPEG, PNG, WebP only)
    const isValidSignature = validateImageSignature(file.buffer, file.mimetype);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG, PNG, and WebP images are allowed.",
      });
    }

    // 4. Buffer size validation
    if (file.buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
    }

    // 5. Generate unique object key in R2
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const uniqueName = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const newKey = `courses/${courseId}/thumbnail/${uniqueName}`;

    // 6. Upload buffer to private R2
    await uploadFileToR2({
      key: newKey,
      buffer: file.buffer,
      contentType: file.mimetype || "image/jpeg",
    });

    // Save previous key for deletion after success
    const oldKey = course.thumbnailKey;

    // 7. Update database record with the new R2 key and generate signed URL
    course.thumbnailKey = newKey;
    
    let signedUrl = "";
    try {
      signedUrl = await getSignedUrlForR2({ key: newKey });
      if (!course.media) course.media = {};
      course.media.thumbnail = signedUrl;
    } catch (urlErr) {
      console.error("⚠️ Failed to generate signed URL for thumbnail:", urlErr);
    }
    
    await course.save();

    // 8. Cleanup old R2 object ONLY AFTER new upload and DB save succeed
    if (oldKey) {
      deleteFromR2({ key: oldKey }).catch((cleanupErr) => {
        console.error("⚠️ Failed to delete old thumbnail from R2:", cleanupErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course thumbnail uploaded successfully",
      thumbnailKey: newKey,
      thumbnail: signedUrl,
    });
  } catch (error) {
    console.error("❌ Error in uploadThumbnail controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error uploading course thumbnail",
    });
  }
};
