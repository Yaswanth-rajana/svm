import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import nodemailer from 'nodemailer';

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
 * Generate a PDF Certificate for a user using Puppeteer
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

  const htmlPath = path.join(templatesDir, 'certificateTemplate.html');
  const cssPath = path.join(templatesDir, 'certificateTemplate.css');

  if (!fs.existsSync(htmlPath) || !fs.existsSync(cssPath)) {
    throw new Error('Certificate HTML or CSS template is missing from backend/src/templates');
  }

  // Read template and style sheet
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Inject CSS style
  htmlContent = htmlContent.replace('/* INJECT_CSS_HERE */', cssContent);

  // Replace placeholders
  const bgImagePath = path.join(templatesDir, 'certificate_template.jpeg');
  let dataUrl = "";
  if (fs.existsSync(bgImagePath)) {
    const bgImageBuffer = fs.readFileSync(bgImagePath);
    const base64Image = bgImageBuffer.toString('base64');
    dataUrl = `data:image/jpeg;base64,${base64Image}`;
  }

  const replacements = {
    fullName: data.fullName,
    webinarTitle: data.webinarTitle,
    webinarDate: data.webinarDate,
    mentorName: data.mentorName,
    organizationName: data.organizationName,
    certificateId: data.certificateId,
    backgroundImagePath: dataUrl
  };

  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(placeholder, value);
  }

  // Launch Puppeteer (configured for VPS / Hostinger compatibility)
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    
    // Set HTML page content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Format safe file name for participant
    const safeName = data.fullName.trim().replace(/[^a-zA-Z0-9]/g, '_');
    const pdfFilename = `SMVEN-Certificate-${safeName}-${data.certificateId}.pdf`;
    const outputPath = path.join(tempDir, pdfFilename);

    // Render A4 PDF Landscape
    await page.pdf({
      path: outputPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    return outputPath;
  } finally {
    await browser.close();
  }
};

/**
 * Send the generated certificate PDF via Nodemailer using ZeptoMail SMTP
 * @param {string} email - Participant registered email
 * @param {string} fullName - Participant's full name
 * @param {string} pdfPath - Local path to the PDF
 * @param {string} webinarTitle - Webinar Title
 * @returns {Promise<void>}
 */
export const sendCertificateEmail = async (email, fullName, pdfPath, webinarTitle) => {
  const apiKey = process.env.ZEPTO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("Email configuration missing in backend/.env: ZEPTO_API_KEY or FROM_EMAIL");
  }

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

  const safeNameForAttachment = `SMVEN-Certificate-${fullName.trim().replace(/\s+/g, '-')}.pdf`;

  const mailOptions = {
    from: `"Smart Mate Ventures" <${fromEmail}>`,
    to: email,
    subject: `Your SMVEN Webinar Certificate 🎓`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://smven.com/Logo.1.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
        </div>

        <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Congratulations, ${fullName}! 🎉</h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Thank you for attending the <strong>${webinarTitle}</strong>. We hope the session provided you with valuable insights and clear actionable steps for your career development.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          As promised, your official <strong>Certificate of Participation</strong> has been successfully generated and is attached to this email.
        </p>

        <!-- Dynamic Card -->
        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Document Attached</p>
          <p style="margin: 6px 0 0; font-size: 16px; color: #111827; font-weight: 600;">${safeNameForAttachment}</p>
        </div>

        <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
          We look forward to seeing you in our upcoming cohorts and helping you advance in your IT Infrastructure career.
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
          <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Helping you build a high-growth career in IT Infrastructure</p>
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
  } finally {
    // Ensure temporary PDF is always deleted from server
    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log(`🗑️ Temporary PDF deleted: ${pdfPath}`);
      }
    } catch (cleanupErr) {
      console.error(`⚠️ Failed to delete temp PDF at ${pdfPath}:`, cleanupErr.message);
    }
  }
};
