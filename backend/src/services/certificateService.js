import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';
import { getProgramConfig } from '../config/programConfig.js';
import { webinarConfig } from '../config/webinarConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const backendRoot = path.resolve(__dirname, '../../');
const tempDir = path.join(backendRoot, 'temp-certificates');
const templatesDir = path.join(backendRoot, 'src/templates');

/**
 * Ensures the temp directory exists
 */
const ensureTempDirExists = () => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
};

/**
 * Generate a PDF Certificate for a user using pdf-lib (pure JS, no Puppeteer/Chrome required)
 * @param {Object} data - Participant data
 * @param {string} data.fullName - Participant's full name
 * @param {string} data.webinarTitle - Webinar Title
 * @param {string} data.webinarDate - Webinar Date
 * @param {string} data.mentorName - Mentor's Name
 * @param {string} data.organizationName - Org Name
 * @param {string} data.certificateId - Unique Certificate ID
 * @returns {Promise<string>} Path to the generated PDF
 */
export const generateCertificatePDF = async (data) => {
  ensureTempDirExists();

  const bgImagePath = path.join(templatesDir, 'certificate_template.jpeg');
  if (!fs.existsSync(bgImagePath)) {
    throw new Error('Certificate template background image is missing from backend/src/templates');
  }

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // A4 dimensions in points: 841.89 x 595.28 (landscape)
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Load the background image
  const bgImageBytes = fs.readFileSync(bgImagePath);
  const bgImage = await pdfDoc.embedJpg(bgImageBytes);

  // Draw the background image to fill the page
  page.drawImage(bgImage, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 1. Draw Certificate No. at top left if present
  if (data.certificateId) {
    const certNoText = `Certificate No.: ${data.certificateId}`;
    page.drawText(certNoText, {
      x: 215,
      y: 546,
      size: 9.5,
      font: regularFont,
      color: rgb(71 / 255, 85 / 255, 105 / 255), // Slate 600
    });
  }

  // 2. Dynamic Full Name placed prominently in Candidate Name field
  const fullName = data.fullName.trim();
  let fontSize = 35;
  let textWidth = font.widthOfTextAtSize(fullName, fontSize);

  // Auto-scale font size if name is extremely long
  while (textWidth > 550 && fontSize > 20) {
    fontSize -= 2;
    textWidth = font.widthOfTextAtSize(fullName, fontSize);
  }

  const x = (pageWidth - textWidth) / 2;
  const y = 335; // Centered vertically in candidate name area

  // Draw the text
  page.drawText(fullName, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(15 / 255, 23 / 255, 42 / 255), // Slate 900: #0f172a
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  // Clean up any old PDF files for this certificateId to avoid serving stale names
  if (data.certificateId) {
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        if (file.includes(data.certificateId) && file.endsWith('.pdf')) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      }
    } catch (cleanErr) {
      console.warn("⚠️ Error cleaning up older certificate PDFs:", cleanErr.message);
    }
  }

  // Format safe file name for participant
  const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
  const pdfFilename = `SMVEN-Certificate-${safeName}-${data.certificateId}.pdf`;
  const outputPath = path.join(tempDir, pdfFilename);

  fs.writeFileSync(outputPath, pdfBytes);
  return outputPath;
};

/**
 * Send the generated certificate PDF via Nodemailer using ZeptoMail SMTP
 * @param {string} email - Participant registered email
 * @param {string} fullName - Participant's full name
 * @param {string} pdfPath - Local path to the PDF
 * @param {string} webinarTitle - Webinar Title
 * @returns {Promise<void>}
 */
export const sendCertificateEmail = async (email, fullName, pdfPath, webinarTitle, program) => {
  const apiKey = process.env.ZEPTO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("Email configuration missing in backend/.env: ZEPTO_API_KEY or FROM_EMAIL");
  }

  const programConfig = getProgramConfig(program);

  // Initialize Nodemailer with ZeptoMail SMTP credentials
  const transporter = nodemailer.createTransport({
    host: 'smtp.zeptomail.in',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'emailapikey',
      pass: apiKey
    }
  });

  const courseTitle = webinarTitle || webinarConfig.webinarTitle || "VMware vSphere Foundation - Build, Manage and Operate";
  const safeNameForAttachment = `SMVEN-Certificate-${fullName.trim().replace(/\s+/g, '-')}.pdf`;

  const mailOptions = {
    from: `"Smart Mate Ventures" <${fromEmail}>`,
    to: email,
    subject: `Your Certificate of Completion - ${courseTitle} 🎓`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://smven.com/Logo.1.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
        </div>

        <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Congratulations, ${fullName}! 🎉</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Thank you for successfully completing our 50 Hours of Training Program on <strong>${courseTitle}</strong>. We hope the session provided you with valuable insights, practical experience, and clear actionable steps for your career development.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          As promised, your official <strong>Certificate of Completion</strong> has been successfully generated and is attached to this email.
        </p>

        <!-- Dynamic Card -->
        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Document Attached</p>
          <p style="margin: 6px 0 0; font-size: 16px; color: #111827; font-weight: 600;">${safeNameForAttachment}</p>
        </div>

        <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
          We look forward to seeing you in our upcoming cohorts and helping you advance in your IT Engineering career.
        </p>

        <!-- Support Info -->
        <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #2563eb;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;">
            <strong>Need help?</strong> If you notice any spelling issues in your name, contact us at <a href="mailto:hello@smven.com" style="color: #2563eb; text-decoration: underline;">hello@smven.com</a>.
          </p>
        </div>

        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
        
        <!-- Footer -->
        <div style="text-align: center;">
          <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 700;">Smart Mate Ventures</p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Helping you build a high-growth career in IT Engineering</p>
          <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
            &copy; 2026 Smart Mate Ventures. All rights reserved.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: safeNameForAttachment,
        path: pdfPath
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Certificate email sent successfully to ${email}`);
  } catch (sendErr) {
    console.error(`⚠️ Failed to send certificate email to ${email}:`, sendErr.message);
    throw sendErr;
  }
};

