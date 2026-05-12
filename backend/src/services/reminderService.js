import axios from 'axios';
import { maskEmail } from '../utils/logger.js';

/**
 * Sends a reminder email for the webinar via ZeptoMail API.
 * 
 * @param {Object} params - The recipient details.
 * @param {string} params.name - Recipient's name.
 * @param {string} params.email - Recipient's email address.
 * @param {number} params.daysLeft - Number of days left for the webinar (1, 3, or 7).
 * @param {Date} params.eventDate - Date of the webinar.
 */
export const sendReminderEmail = async ({ name, email, daysLeft, eventDate }) => {
    const apiKey = process.env.ZEPTO_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!apiKey || !fromEmail) {
        console.error("❌ Email config missing: ZEPTO_API_KEY or FROM_EMAIL is not defined in .env");
        return;
    }

    const safeName = name || "User";
    const url = 'https://api.zeptomail.in/v1.1/email';
    
    let subject = "";
    let messageBody = "";

    const formattedDate = new Date(eventDate).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short'
    });

    if (daysLeft === 7) {
        subject = "⏳ 1 Week to go! IT Infrastructure Webinar";
        messageBody = `Just a quick reminder that our highly anticipated <strong>IT Infrastructure Engineering Roadmap</strong> webinar is exactly <strong>1 week away</strong>. Make sure your calendar is marked!`;
    } else if (daysLeft === 3) {
        subject = "⌛ 3 Days left! Get ready for your IT Infrastructure Webinar";
        messageBody = `We're only <strong>3 days away</strong> from the webinar! Get ready to explore the exciting world of IT Infrastructure and learn how to build a high-growth career.`;
    } else if (daysLeft === 1) {
        subject = "🚨 Tomorrow is the day! IT Infrastructure Webinar";
        messageBody = `This is it! Tomorrow is the day of our <strong>IT Infrastructure Engineering Roadmap</strong> webinar. We are extremely excited to see you there. Make sure to join a few minutes early to secure your spot.`;
    }

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
                    <img src="https://smven.com/logo.png" alt="Smart Mate Ventures Logo" style="width: 140px; height: auto; margin-bottom: 12px;" />
                </div>

                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Hi ${safeName},</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    ${messageBody}
                </p>
                
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                    <div style="margin-bottom: 16px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Date & Time</p>
                        <p style="margin: 4px 0 0; font-size: 18px; color: #111827; font-weight: 600;">${formattedDate}</p>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Access Link</p>
                        <div style="margin-top: 12px;">
                            <a href="https://zoom.us/j/meeting-id" style="display: inline-block; padding: 14px 28px; background-color: #ff5a5f; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">👉 Join Webinar</a>
                        </div>
                    </div>
                </div>

                <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px;">
                    We'll send you a final reminder 15 minutes before the session starts. We recommend joining 5 minutes early to test your audio.
                </p>

                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
                
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

    try {
        await axios.post(url, data, config);
        console.log(`✅ [PID: ${process.pid}] ${daysLeft}-day reminder email sent successfully to: ${maskEmail(email)}`);
    } catch (error) {
        console.error(`❌ Failed to send ${daysLeft}-day reminder email to ${email}:`);
        if (error.response) {
            console.error('ZeptoMail Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
};
