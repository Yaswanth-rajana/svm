import axios from 'axios';
import { maskEmail } from '../utils/logger.js';
import { getProgramConfig } from '../config/programConfig.js';

/**
 * Formats a program slug into a human-readable title-cased name.
 * e.g., 'cloud-computing' -> 'Cloud Computing'
 * e.g., 'it-infrastructure' -> 'IT Infrastructure'
 * e.g., 'devops-engineering' -> 'DevOps Engineering'
 * 
 * @param {string} program - The program slug
 * @returns {string} The formatted program name
 */
export const getProgramLabel = (program) => {
    return getProgramConfig(program).shortTitle;
};


/**
 * Formats an Indian phone number stored with a '91' prefix.
 * e.g., '911234567890' -> '+91 12345 67890'
 * 
 * @param {string} phone - The raw phone number
 * @returns {string} The formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const phoneStr = phone.toString().replace(/\+/g, "");
    if (phoneStr.startsWith("91") && phoneStr.length === 12) {
        return `+91 ${phoneStr.slice(2, 7)} ${phoneStr.slice(7)}`;
    }
    return phone.startsWith("+") ? phone : "+" + phone;
};

/**
 * Sends a webinar registration confirmation email via ZeptoMail API.
 * This function is designed to be fire-and-forget (non-blocking).
 * 
 * @param {Object} params - The recipient details.
 * @param {string} params.name - Recipient's name.
 * @param {string} params.email - Recipient's email address.
 */
export const sendConfirmationEmail = ({ name, email, program }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    // Safety Check
    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

    const programConfig = getProgramConfig(program);
    const safeName = name || "User";
    const url = 'https://api.zeptomail.in/v1.1/email';

    const data = {
        from: {
            address: fromEmail,
            name: "Smart Mate Ventures"
        },
        to: [
            {
                email_address: {
                    address: email,
                    name: safeName
                }
            }
        ],
        subject: programConfig.emailSubject,
        htmlbody: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
                
                <!-- Logo/Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="https://smven.com/Logo.1.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
                </div>

                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">You're in, ${safeName}! 🎉</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Your seat is confirmed for the <strong>${programConfig.title}</strong> Program. We're excited to help you navigate your career in this high-demand field.
                </p>
                
                <!-- Webinar Details Card -->
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                    <div style="margin-bottom: 16px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Date & Time</p>
                        <p style="margin: 4px 0 0; font-size: 18px; color: #111827; font-weight: 600;">Saturday, July 4, 2026 at 10:00 AM IST</p>
                        <p style="margin: 8px 0 0; font-size: 14px;">
                            📅 <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(programConfig.title)}&dates=20260704T043000Z/20260704T060000Z&details=Join+our+exclusive+program+to+build+your+${encodeURIComponent(programConfig.shortTitle)}+career.&location=https://zoom.us/j/meeting-id" style="color: #2563eb; text-decoration: none; font-weight: 500;">Add to Google Calendar</a>
                        </p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Access Link</p>
                        <div style="margin-top: 12px;">
                            <a href="https://zoom.us/j/meeting-id" style="display: inline-block; padding: 14px 28px; background-color: #ff5a5f; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">👉 Join Program</a>
                        </div>
                        <p style="margin: 12px 0 0; font-size: 12px; color: #9ca3af;">
                            If the button doesn't work, copy this link: <br/>
                            <span style="color: #2563eb;">https://zoom.us/j/meeting-id</span>
                        </p>
                    </div>
                </div>

                <!-- Value Section -->
                <div style="margin-bottom: 32px;">
                    <h3 style="color: #111827; font-size: 18px; font-weight: 700; margin-bottom: 12px;">What you'll learn:</h3>
                    <ul style="padding-left: 20px; margin: 0; color: #4b5563; line-height: 1.6;">
                        ${programConfig.learningPoints.map(point => `<li style="margin-bottom: 8px;">${point}</li>`).join('')}
                    </ul>
                </div>

                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
                    We'll send you a reminder 30 minutes before the session starts. We recommend joining 5 minutes early to test your audio.
                </p>

                <!-- Support Section -->
                <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #2563eb;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                        <strong>Need help?</strong> Contact us at <a href="mailto:hello@smven.com" style="color: #2563eb; text-decoration: underline;">hello@smven.com</a>
                    </p>
                </div>

                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
                
                <!-- Footer -->
                <div style="text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 700;">Smart Mate Ventures</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Helping you build a high-growth career in ${programConfig.shortTitle}</p>
                    <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
                        &copy; 2026 Smart Mate Ventures. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    // Non-blocking call: Not using await here as per requirement
    axios.post(url, data, config)
        .then(response => {
            console.log(`✅ Confirmation email sent successfully to: ${maskEmail(email)}`);
        })
        .catch(error => {
            console.error('❌ Failed to send confirmation email:');
            if (error.response) {
                console.error('ZeptoMail Error Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Error Message:', error.message);
            }
        });
};

/**
 * Sends a confirmation email after a "Request a Call" submission.
 * 
 * @param {Object} params - Recipient details.
 * @param {string} params.name - Recipient's name.
 * @param {string} params.email - Recipient's email address.
 */
export const sendCallRequestEmail = ({ name, email, program }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    // Safety Check
    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

    const programConfig = getProgramConfig(program);
    const safeName = name || "User";
    const url = 'https://api.zeptomail.in/v1.1/email';

    const data = {
        from: {
            address: fromEmail,
            name: "Smart Mate Ventures"
        },
        to: [
            {
                email_address: {
                    address: email,
                    name: safeName
                }
            }
        ],
        subject: "We received your request 📞",
        htmlbody: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
                
                <!-- Logo/Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="https://smven.com/Logo.1.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
                </div>

                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">We've received your request, ${safeName}! 📞</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Thank you for reaching out to <strong>Smart Mate Ventures</strong>. We've received your request for a callback, and we're excited to connect with you.
                </p>
                
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0; font-size: 16px; color: #111827; line-height: 1.6;">
                        One of our career experts will review your profile and contact you within the next <strong>24 hours</strong> to discuss your career goals in ${programConfig.shortTitle}.
                    </p>
                </div>

                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
                    In the meantime, feel free to explore our website for more resources on ${programConfig.shortTitle} Engineering and the current job market trends.
                </p>

                <!-- Support Section -->
                <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #2563eb;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                        <strong>Have immediate questions?</strong> Reply to this email or contact us at <a href="mailto:hello@smven.com" style="color: #2563eb; text-decoration: underline;">hello@smven.com</a>
                    </p>
                </div>

                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
                
                <!-- Footer -->
                <div style="text-align: center;">
                    <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 700;">Smart Mate Ventures</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Helping you build a high-growth career in ${programConfig.shortTitle}</p>
                    <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
                        &copy; 2026 Smart Mate Ventures. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    // Non-blocking call
    axios.post(url, data, config)
        .then(response => {
            console.log(`✅ Call request confirmation email sent to: ${maskEmail(email)}`);
        })
        .catch(error => {
            console.error('❌ Failed to send call request email:');
            if (error.response) {
                console.error('ZeptoMail Error:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Error Message:', error.message);
            }
        });
};

/**
 * Sends an OTP email.
 * 
 * @param {string} email - Recipient's email address.
 * @param {string} otp - The OTP to send.
 */
export const sendEmailOTP = async (email, otp) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    // Safety Check
    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        throw new Error("Email credentials missing");
    }

    const url = 'https://api.zeptomail.in/v1.1/email';

    const data = {
        from: {
            address: fromEmail,
            name: "Smart Mate Ventures"
        },
        to: [
            {
                email_address: {
                    address: email,
                    name: "User"
                }
            }
        ],
        subject: `${otp} is your verification code`,
        htmlbody: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Verify your email</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Your OTP is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong>
                </p>
                <p style="font-size: 14px; color: #6b7280;">This code will expire in 5 minutes. Do not share it with anyone.</p>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await axios.post(url, data, config);
        console.log(`✅ Email OTP sent successfully to: ${maskEmail(email)}`);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to send email OTP:');
        if (error.response) {
            console.error('ZeptoMail Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
        throw error;
    }
};

/**
 * Sends a webinar registration admin notification email.
 * 
 * @param {Object} params - Registration details.
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.workingProfile
 * @param {string} params.experience
 * @param {string} params.paymentStatus
 */
export const sendRegistrationAdminEmail = ({ name, email, phone, workingProfile, experience, paymentStatus, program }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;
    const formattedPhone = formatPhoneNumber(phone);
    const programLabel = getProgramLabel(program);

    // Safety Check
    if (!apiKey || !fromEmail || !adminEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY, FROM_EMAIL or ADMIN_EMAIL is not defined in .env");
        return;
    }

    const url = 'https://api.zeptomail.in/v1.1/email';
    const registrationTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const data = {
        from: {
            address: fromEmail,
            name: "System Notification"
        },
        to: [
            {
                email_address: {
                    address: adminEmail,
                    name: "Admin"
                }
            }
        ],
        subject: "🎉 New Program Registration",
        htmlbody: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
                <h2 style="color: #111827; margin-bottom: 16px;">New Program Registration 🎉</h2>
                <p>A new user has successfully registered for the program.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${name}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${email}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formattedPhone}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Working Profile</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${workingProfile || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Experience</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${experience || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Status</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${paymentStatus || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Program</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${programLabel}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Registration Time</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${registrationTime}</td></tr>
                </table>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    // Non-blocking call
    axios.post(url, data, config)
        .then(() => {
            console.log(`✅ Admin notification (Webinar) sent successfully to: ${adminEmail}`);
        })
        .catch(error => {
            console.error('❌ Failed to send admin notification (Webinar):');
            if (error.response) {
                console.error('ZeptoMail Error:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Error Message:', error.message);
            }
        });
};

/**
 * Sends a call request admin notification email.
 * 
 * @param {Object} params - Request details.
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.phone
 * @param {string} params.preferredTime
 * @param {string} params.message
 */
export const sendCallRequestAdminEmail = ({ name, email, phone, preferredTime, message, program }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;
    const formattedPhone = formatPhoneNumber(phone);
    const programLabel = getProgramLabel(program);

    // Safety Check
    if (!apiKey || !fromEmail || !adminEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY, FROM_EMAIL or ADMIN_EMAIL is not defined in .env");
        return;
    }

    const url = 'https://api.zeptomail.in/v1.1/email';
    const submittedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const data = {
        from: {
            address: fromEmail,
            name: "System Notification"
        },
        to: [
            {
                email_address: {
                    address: adminEmail,
                    name: "Admin"
                }
            }
        ],
        subject: "📞 New Request a Call Lead",
        htmlbody: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
                <h2 style="color: #111827; margin-bottom: 16px;">New Call Request 📞</h2>
                <p>A new user has requested a call.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${name}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${email}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Phone</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formattedPhone}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Preferred Time</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${preferredTime || 'Not specified'}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Message / Query</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${message || 'None'}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Program</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${programLabel}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Submitted Time</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${submittedTime}</td></tr>
                </table>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    // Non-blocking call
    axios.post(url, data, config)
        .then(() => {
            console.log(`✅ Admin notification (Call Request) sent successfully to: ${adminEmail}`);
        })
        .catch(error => {
            console.error('❌ Failed to send admin notification (Call Request):');
            if (error.response) {
                console.error('ZeptoMail Error:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('Error Message:', error.message);
            }
        });
};

/**
 * Sends an admin notification for a registration with pending payment.
 * 
 * @param {Object} params - Registration details.
 */
export const sendPendingPaymentAdminEmail = ({ name, email, phone, source, registrationTime, program }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;
    const formattedPhone = formatPhoneNumber(phone);
    const programLabel = getProgramLabel(program);

    if (!apiKey || !fromEmail || !adminEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY, FROM_EMAIL or ADMIN_EMAIL is not defined in .env");
        return;
    }

    const url = 'https://api.zeptomail.in/v1.1/email';
    const data = {
        from: { address: fromEmail, name: "System Notification" },
        to: [{ email_address: { address: adminEmail, name: "Admin" } }],
        subject: "⚠️ New Registration With Pending Payment",
        htmlbody: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
                <h2 style="color: #111827; margin-bottom: 16px;">Pending Payment Alert ⚠️</h2>
                <p>A user has registered but has not yet completed the payment.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">User Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${name}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${email}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Phone Number</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formattedPhone}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Program Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${programLabel} Program</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Program</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${programLabel}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Status</td><td style="padding: 8px; border: 1px solid #e5e7eb; color: #d97706; font-weight: bold;">Pending</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Registration Time</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${registrationTime}</td></tr>
                </table>
            </div>
        `
    };

    const config = { headers: { 'Authorization': `Zoho-enczapikey ${apiKey}`, 'Content-Type': 'application/json' } };
    axios.post(url, data, config)
        .then(() => console.log(`✅ Admin alert (Pending Payment) sent successfully for: ${maskEmail(email)}`))
        .catch(error => console.error('❌ Failed to send admin alert (Pending Payment):', error.message));
};

/**
 * Sends an admin notification for a failed payment.
 * 
 * @param {Object} params - Payment details.
 */
export const sendFailedPaymentAdminEmail = ({ name, email, phone, amount, paymentMethod, registrationTime, program }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const adminEmail = process.env.ADMIN_EMAIL;
    const formattedPhone = formatPhoneNumber(phone);
    const programLabel = getProgramLabel(program);

    if (!apiKey || !fromEmail || !adminEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY, FROM_EMAIL or ADMIN_EMAIL is not defined in .env");
        return;
    }

    const url = 'https://api.zeptomail.in/v1.1/email';
    const data = {
        from: { address: fromEmail, name: "System Notification" },
        to: [{ email_address: { address: adminEmail, name: "Admin" } }],
        subject: "❌ Payment Failed Alert",
        htmlbody: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
                <h2 style="color: #ef4444; margin-bottom: 16px;">Payment Failed Alert ❌</h2>
                <p>A payment attempt has failed for a registration.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">User Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${name}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${email}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Phone Number</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formattedPhone}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Program Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${programLabel} Program</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Program</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${programLabel}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Status</td><td style="padding: 8px; border: 1px solid #e5e7eb; color: #ef4444; font-weight: bold;">Failed</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Payment Method</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${paymentMethod || 'Unknown'}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Registration Time</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${registrationTime}</td></tr>
                </table>
            </div>
        `
    };

    const config = { headers: { 'Authorization': `Zoho-enczapikey ${apiKey}`, 'Content-Type': 'application/json' } };
    axios.post(url, data, config)
        .then(() => console.log(`✅ Admin alert (Payment Failed) sent successfully for: ${maskEmail(email)}`))
        .catch(error => console.error('❌ Failed to send admin alert (Payment Failed):', error.message));
};

/**
 * Sends the second installment payment link to the student.
 */
export const sendSecondInstallmentLinkEmail = ({ name, email, program, paymentLinkUrl, dueDate }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

    const programConfig = getProgramConfig(program);
    const safeName = name || "Student";
    const url = 'https://api.zeptomail.in/v1.1/email';
    const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const data = {
        from: {
            address: fromEmail,
            name: "Smart Mate Ventures"
        },
        to: [
            {
                email_address: {
                    address: email,
                    name: safeName
                }
            }
        ],
        subject: `Installment Payment Link: ${programConfig.shortTitle} Program`,
        htmlbody: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="https://smven.com/Logo.1.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
                </div>

                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Hello ${safeName},</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                    Thank you for choosing the <strong>${programConfig.shortTitle}</strong> program! We have received your registration and your first installment payment of ₹6,500.
                </p>

                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600; margin-bottom: 16px;">Payment Schedule & Plan Details:</h3>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Program:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #111827;">${programConfig.shortTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">First Installment Paid:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #10b981;">₹6,500 (Paid)</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Second Installment Due:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f59e0b;">₹6,500</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Due Date:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #ef4444;">${formattedDate} (within 30 days)</td>
                        </tr>
                    </table>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                    You can pay the remaining second installment at any time before the due date by clicking the link below:
                </p>

                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${paymentLinkUrl}" target="_blank" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                        Pay Second Installment (₹6,500)
                    </a>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 0; border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
                    If you have any questions or require assistance, please reply to this email or reach out to support.
                </p>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    axios.post(url, data, config)
        .then(response => {
            console.log(`✅ Second installment link email sent to: ${maskEmail(email)}`);
        })
        .catch(error => {
            console.error('❌ Failed to send second installment link email:', error.message);
        });
};

/**
 * Sends a confirmation email after full payment is received.
 */
export const sendSecondInstallmentPaidEmail = ({ name, email, program }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

    const programConfig = getProgramConfig(program);
    const safeName = name || "Student";
    const url = 'https://api.zeptomail.in/v1.1/email';

    const data = {
        from: {
            address: fromEmail,
            name: "Smart Mate Ventures"
        },
        to: [
            {
                email_address: {
                    address: email,
                    name: safeName
                }
            }
        ],
        subject: `Payment Completed: ${programConfig.shortTitle} Program`,
        htmlbody: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="https://smven.com/Logo.1.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
                </div>

                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Fee Payment Completed! 🎓</h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                    Hello ${safeName}, we are pleased to inform you that we have received your second installment payment of ₹6,500. Your program fees are now <strong>fully paid</strong>!
                </p>

                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600; margin-bottom: 16px;">Billing Summary:</h3>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Program:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #111827;">${programConfig.shortTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Total Amount Paid:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #10b981;">₹13,000</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Outstanding Balance:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #10b981;">₹0 (Paid in Full)</td>
                        </tr>
                    </table>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                    All course benefits, including eligibility to claim your training certificate upon course completion, are now fully unlocked!
                </p>

                <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 0; border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
                    Thank you for your prompt payment. We look forward to seeing your career growth!
                </p>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    axios.post(url, data, config)
        .then(response => {
            console.log(`✅ Second installment completion email sent to: ${maskEmail(email)}`);
        })
        .catch(error => {
            console.error('❌ Failed to send second installment completion email:', error.message);
        });
};

/**
 * Sends a reminder email for the second installment.
 */
export const sendSecondInstallmentReminderEmail = ({ name, email, program, paymentLinkUrl, dueDate, daysLeft }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

    const programConfig = getProgramConfig(program);
    const safeName = name || "Student";
    const url = 'https://api.zeptomail.in/v1.1/email';
    const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const isOverdue = daysLeft < 0;
    const subject = isOverdue 
        ? `⚠️ OVERDUE: Installment Payment for ${programConfig.shortTitle}`
        : `Reminder: Second Installment Due in ${daysLeft} days for ${programConfig.shortTitle}`;

    const reminderMessage = isOverdue
        ? `This is an urgent notice that your second installment payment of ₹6,500 is overdue. It was due on <strong>${formattedDate}</strong>.`
        : `This is a friendly reminder that your second installment payment of ₹6,500 is due in <strong>${daysLeft} days</strong> (on or before <strong>${formattedDate}</strong>).`;

    const data = {
        from: {
            address: fromEmail,
            name: "Smart Mate Ventures"
        },
        to: [
            {
                email_address: {
                    address: email,
                    name: safeName
                }
            }
        ],
        subject: subject,
        htmlbody: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="https://smven.com/Logo.1.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
                </div>

                <h2 style="color: ${isOverdue ? '#ef4444' : '#111827'}; font-size: 22px; font-weight: 700; margin-bottom: 16px;">
                    ${isOverdue ? 'Overdue Payment Notice ⚠️' : 'Payment Reminder 🗓️'}
                </h2>
                
                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                    Hello ${safeName}, ${reminderMessage}
                </p>

                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600; margin-bottom: 16px;">Installment Details:</h3>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Program:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #111827;">${programConfig.shortTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Due Amount:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #ef4444;">₹6,500</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #6b7280;">Due Date:</td>
                            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #ef4444;">${formattedDate}</td>
                        </tr>
                    </table>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                    Please click the link below to complete your second installment payment:
                </p>

                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${paymentLinkUrl}" target="_blank" style="background: linear-gradient(135deg, ${isOverdue ? '#ef4444, #dc2626' : '#2563eb, #1d4ed8'}); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);">
                        Pay Installment (₹6,500)
                    </a>
                </div>

                <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 0; border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
                    If you have already paid, please ignore this email. Contact support for any billing concerns.
                </p>
            </div>
        `
    };

    const config = {
        headers: {
            'Authorization': `Zoho-enczapikey ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    axios.post(url, data, config)
        .then(response => {
            console.log(`✅ Installment reminder email sent to: ${maskEmail(email)}`);
        })
        .catch(error => {
            console.error('❌ Failed to send installment reminder email:', error.message);
        });
};
