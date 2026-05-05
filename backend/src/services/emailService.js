import axios from 'axios';


/**
 * Sends a webinar registration confirmation email via ZeptoMail API.
 * This function is designed to be fire-and-forget (non-blocking).
 * 
 * @param {Object} params - The recipient details.
 * @param {string} params.name - Recipient's name.
 * @param {string} params.email - Recipient's email address.
 */
export const sendConfirmationEmail = ({ name, email }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    // Safety Check
    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

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
        subject: "🚀 IT Infrastructure Webinar – Access details",
        htmlbody: `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #1f2937;">
                
                <!-- Logo/Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="https://smven.com/logo.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
                </div>

                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">You're in, ${safeName}! 🎉</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Your seat is confirmed for the <strong>IT Infrastructure Engineering Roadmap</strong> webinar. We're excited to help you navigate your career in this high-demand field.
                </p>
                
                <!-- Webinar Details Card -->
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                    <div style="margin-bottom: 16px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Date & Time</p>
                        <p style="margin: 4px 0 0; font-size: 18px; color: #111827; font-weight: 600;">Sunday, June 07, 2026 at 10:00 AM IST</p>
                        <p style="margin: 8px 0 0; font-size: 14px;">
                            📅 <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=IT+Infrastructure+Engineering+Roadmap+Webinar&dates=20260607T043000Z/20260607T060000Z&details=Join+our+exclusive+webinar+to+build+your+IT+Infrastructure+career.&location=https://zoom.us/j/meeting-id" style="color: #2563eb; text-decoration: none; font-weight: 500;">Add to Google Calendar</a>
                        </p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Access Link</p>
                        <div style="margin-top: 12px;">
                            <a href="https://zoom.us/j/meeting-id" style="display: inline-block; padding: 14px 28px; background-color: #ff5a5f; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">👉 Join Webinar</a>
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
                        <li style="margin-bottom: 8px;">Understand what IT Infrastructure is and how it powers the modern world.</li>
                        <li style="margin-bottom: 8px;">Discover why this is a highly stable, AI-proof career path.</li>
                        <li style="margin-bottom: 8px;">Get insights into job opportunities and salary benchmarks in the domain.</li>
                    </ul>
                </div>

                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
                    We'll send you a reminder 15 minutes before the session starts. We recommend joining 5 minutes early to test your audio.
                </p>

                <!-- Support Section -->
                <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #2563eb;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                        <strong>Need help?</strong> Reply to this email or contact us at <a href="mailto:support@smven.com" style="color: #2563eb; text-decoration: underline;">support@smven.com</a>
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
            console.log(`✅ Confirmation email sent successfully to: ${email}`);
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
export const sendCallRequestEmail = ({ name, email }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    // Safety Check
    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

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
                    <img src="https://smven.com/logo.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                    <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">Building the next generation of IT Engineers</p>
                </div>

                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">We've received your request, ${safeName}! 📞</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Thank you for reaching out to <strong>Smart Mate Ventures</strong>. We've received your request for a callback, and we're excited to connect with you.
                </p>
                
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                    <p style="margin: 0; font-size: 16px; color: #111827; line-height: 1.6;">
                        One of our career experts will review your profile and contact you within the next <strong>24 hours</strong> to discuss your career goals in IT Infrastructure.
                    </p>
                </div>

                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
                    In the meantime, feel free to explore our website for more resources on IT Infrastructure Engineering and the current job market trends.
                </p>

                <!-- Support Section -->
                <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin-bottom: 32px; border-left: 4px solid #2563eb;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                        <strong>Have immediate questions?</strong> Reply to this email or contact us at <a href="mailto:support@smven.com" style="color: #2563eb; text-decoration: underline;">support@smven.com</a>
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
            console.log(`✅ Call request confirmation email sent to: ${email}`);
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
        console.log(`✅ Email OTP sent successfully to: ${email}`);
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
