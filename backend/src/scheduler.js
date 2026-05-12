import cron from 'node-cron';
import Lead from './models/Lead.js';
import { sendReminderEmail } from './services/reminderService.js';
import { sendPendingPaymentAdminEmail } from './services/emailService.js';
import { maskEmail } from './utils/logger.js';

/**
 * Initializes the cron jobs for the application.
 */
export const initScheduler = () => {
    // 1. Daily Reminder Job (Run every day at 9:00 AM IST)
    // IST is UTC+5:30. 9:00 AM IST = 3:30 AM UTC
    // Note: If running on a server with different timezone, adjust accordingly.
    cron.schedule('* * * * *', async () => {
        console.log(`⏰ [Scheduler] Running daily reminder job at 9:00 AM IST...`);
        try {
            const leads = await Lead.find({ 
              isVerified: true,
              paymentStatus: "paid" 
            });

            console.log(`🔍 [Scheduler] Query found ${leads.length} leads with paymentStatus: "paid"`);
            
            let emailsSent = 0;

            for (const lead of leads) {
                if (lead.paymentStatus !== "paid") continue;
                if (!lead.eventDate) continue;
                
                const today = new Date();
                const event = new Date(lead.eventDate);

                const diffDays = Math.ceil(
                  (event.setHours(0,0,0,0) - today.setHours(0,0,0,0)) 
                  / (1000 * 60 * 60 * 24)
                );

                // 7-day reminder
                if (diffDays <= 7 && diffDays > 6 && !lead.reminder7Sent) {
                    await sendReminderEmail({
                        name: lead.name,
                        email: lead.email,
                        daysLeft: 7,
                        eventDate: lead.eventDate
                    });
                    lead.reminder7Sent = true;
                    await lead.save();
                    emailsSent++;
                }
                // 3-day reminder
                else if (diffDays <= 3 && diffDays > 2 && !lead.reminder3Sent) {
                    await sendReminderEmail({
                        name: lead.name,
                        email: lead.email,
                        daysLeft: 3,
                        eventDate: lead.eventDate
                    });
                    lead.reminder3Sent = true;
                    await lead.save();
                    emailsSent++;
                }
                // 1-day reminder
                else if (diffDays <= 1 && diffDays >= 0 && !lead.reminder1Sent) {
                    await sendReminderEmail({
                        name: lead.name,
                        email: lead.email,
                        daysLeft: 1,
                        eventDate: lead.eventDate
                    });
                    lead.reminder1Sent = true;
                    await lead.save();
                    emailsSent++;
                }
            }

            console.log(`✅ Daily reminder job completed. Sent ${emailsSent} reminder emails.`);
        } catch (error) {
            console.error('❌ Error running daily reminder job:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    // 2. Pending Payment Alert Job (Runs every 15 minutes)
    // Notifies admin if a user hasn't completed payment after 30 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log(`⏰ [Scheduler] Running pending payment alert job...`);
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            
            // Find leads where:
            // - Source includes webinar
            // - Payment is pending
            // - We haven't sent this alert yet
            // - Created more than 30 minutes ago
            const pendingLeads = await Lead.find({
                sources: "webinar",
                paymentStatus: "pending",
                pendingPaymentAlertSent: { $ne: true },
                createdAt: { $lt: thirtyMinutesAgo }
            });

            console.log(`🔍 [Scheduler] Found ${pendingLeads.length} leads with pending payments older than 30 mins.`);

            for (const lead of pendingLeads) {
                try {
                    sendPendingPaymentAdminEmail({
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        source: "webinar",
                        registrationTime: lead.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                    });

                    lead.pendingPaymentAlertSent = true;
                    await lead.save();
                    console.log(`⚠️ [Scheduler] Sent pending payment alert for: ${maskEmail(lead.email)}`);
                } catch (sendErr) {
                    console.error(`❌ Failed to send pending payment alert for ${lead.email}:`, sendErr.message);
                }
            }
        } catch (error) {
            console.error('❌ Error running pending payment alert job:', error);
        }
    });

    console.log('🗓️  Scheduler initialized.');
    console.log('   - Daily reminder job: 9:00 AM IST');
    console.log('   - Pending payment alerts: Every 15 minutes (for >30 min delay)');
};
