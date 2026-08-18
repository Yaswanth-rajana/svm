import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Define the required environment variables for R2 integration
const requiredEnvVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
];

// Validate that required environment variables exist
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required R2 environment variable: ${envVar}`);
  }
}

// Initialize S3 Client configured for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

/**
 * Uploads an object/file to the Cloudflare R2 bucket.
 * 
 * @param {Object} params
 * @param {string} params.key - The destination path/key in the bucket (e.g. 'test/r2-test.txt')
 * @param {Buffer|string|ReadableStream} params.body - The content of the file
 * @param {string} params.contentType - The MIME type of the file (e.g. 'text/plain')
 * @returns {Promise<{key: string, bucket: string}>} Useful metadata upon successful upload
 * @throws {Error} The original AWS SDK error if the upload fails
 */
export async function uploadToR2({ key, body, contentType }) {
  const bucketName = process.env.R2_BUCKET_NAME;
  
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return {
      key,
      bucket: bucketName,
    };
  } catch (error) {
    // Throw the original error as requested
    throw error;
  }
}

/**
 * Uploads a file buffer wrapper around uploadToR2.
 * 
 * @param {Object} params
 * @param {string} params.key
 * @param {Buffer} params.buffer
 * @param {string} params.contentType
 * @returns {Promise<{key: string, bucket: string}>}
 */
export async function uploadFileToR2({ key, buffer, contentType }) {
  return uploadToR2({ key, body: buffer, contentType });
}

/**
 * Generates a short-lived signed GET URL for a private object in R2.
 * 
 * @param {Object} params
 * @param {string} params.key - The R2 object key
 * @param {number} [params.expiresIn=900] - Expiration in seconds (default: 15 minutes / 900s)
 * @returns {Promise<string>} The temporary signed URL
 */
export async function getSignedUrlForR2({ key, expiresIn = 900, fileName, disposition }) {
  try {
    const s3Params = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    };

    if (fileName) {
      const mode = disposition === "inline" ? "inline" : "attachment";
      s3Params.ResponseContentDisposition = `${mode}; filename="${fileName}"`;
    }

    const command = new GetObjectCommand(s3Params);
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw error;
  }
}

/**
 * Safely deletes an object from R2.
 * 
 * @param {Object} params
 * @param {string} params.key - The R2 object key to delete
 * @returns {Promise<boolean>} Resolves to true if deleted, false if failed (without throwing)
 */
export async function deleteFromR2({ key }) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`⚠️ Failed to delete old R2 object (${key}):`, error);
    return false;
  }
}

/**
 * Initiates a multipart upload to Cloudflare R2.
 */
export async function startMultipartUpload({ key, contentType }) {
  try {
    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    const response = await s3Client.send(command);
    return {
      uploadId: response.UploadId,
      key: response.Key,
    };
  } catch (error) {
    console.error("❌ Error initiating multipart upload:", error);
    throw error;
  }
}

export async function getUploadPartPresignedUrl({ key, uploadId, partNumber, contentType = "video/mp4", expiresIn = 3600 }) {
  try {
    const command = new UploadPartCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    if (contentType) {
      command.middlewareStack.add(
        (next) => (args) => {
          args.request.headers["content-type"] = contentType;
          return next(args);
        },
        {
          step: "build",
          name: "add-content-type-header",
        }
      );
    }

    return await getSignedUrl(s3Client, command, {
      expiresIn,
      signableHeaders: contentType ? new Set(["content-type"]) : undefined,
    });
  } catch (error) {
    console.error("❌ Error generating part presigned URL:", error);
    throw error;
  }
}

/**
 * Completes a multipart upload on Cloudflare R2.
 */
export async function completeMultipartUpload({ key, uploadId, parts }) {
  try {
    const sortedParts = [...parts].sort((a, b) => a.PartNumber - b.PartNumber);
    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: sortedParts,
      },
    });
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error("❌ Error completing multipart upload:", error);
    throw error;
  }
}

/**
 * Aborts a multipart upload on Cloudflare R2.
 */
export async function abortMultipartUpload({ key, uploadId }) {
  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("❌ Error aborting multipart upload:", error);
    return false;
  }
}

/**
 * Checks if a key exists in the Cloudflare R2 bucket.
 */
export async function checkKeyExistsInR2(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error(`⚠️ Error checking key existence in R2 for key: ${key}:`, error.message);
    return false;
  }
}

/**
 * Generates and uploads a premium A4 placeholder PDF to R2 if it doesn't already exist.
 * Returns the placeholder key.
 */
export async function ensurePlaceholderPDFExists() {
  const placeholderKey = "placeholders/lesson_notes_placeholder.pdf";
  try {
    const exists = await checkKeyExistsInR2(placeholderKey);
    if (exists) return placeholderKey;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 portrait
    const { width, height } = page.getSize();

    // Background color (light slate/blue)
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.96, 0.97, 0.98),
    });

    // Dark banner at the top
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(0.07, 0.09, 0.13),
    });

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Banner Text
    page.drawText("SMVEN LEARNING PORTAL", {
      x: 40,
      y: height - 60,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Course Study Material & Notes", {
      x: 40,
      y: height - 90,
      size: 14,
      font: fontRegular,
      color: rgb(0.6, 0.7, 0.9),
    });

    // Main Body Title
    page.drawText("Notes Under Preparation", {
      x: 40,
      y: height - 240,
      size: 24,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    // Main Body Paragraph
    const textLines = [
      "The study material and reference notes for this session are currently being",
      "compiled and designed by the SMVEN technical instruction team.",
      "This placeholder document is shown because the specific PDF resource has not",
      "yet been finalized. Once uploaded, it will replace this page automatically."
    ];

    let currentY = height - 290;
    for (const line of textLines) {
      page.drawText(line, {
        x: 40,
        y: currentY,
        size: 12,
        font: fontRegular,
        color: rgb(0.3, 0.35, 0.45),
      });
      currentY -= 20;
    }

    // Call to Action / Next Steps
    currentY -= 30;
    page.drawText("Next Steps:", {
      x: 40,
      y: currentY,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    currentY -= 25;
    page.drawText("• You can proceed with the video lecture and other course modules in the menu.", {
      x: 50,
      y: currentY,
      size: 11,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    currentY -= 20;
    page.drawText("• Feel free to ask queries in the discussion forum or Q&A channels.", {
      x: 50,
      y: currentY,
      size: 11,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.45),
    });

    // Footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 45,
      color: rgb(0.07, 0.09, 0.13),
    });

    page.drawText("© 2026 SMVEN. All rights reserved.", {
      x: 40,
      y: 18,
      size: 9,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();

    await uploadToR2({
      key: placeholderKey,
      body: Buffer.from(pdfBytes),
      contentType: "application/pdf",
    });

    console.log(`✅ Automatically generated and uploaded placeholder PDF to R2: ${placeholderKey}`);
    return placeholderKey;
  } catch (error) {
    console.error("❌ Error ensuring placeholder PDF exists in R2:", error);
    return placeholderKey;
  }
}
