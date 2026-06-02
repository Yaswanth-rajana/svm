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
    cron.schedule('0 9 * * *', async () => {
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
                        eventDate: lead.eventDate,
                        program: lead.program
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
                        eventDate: lead.eventDate,
                        program: lead.program
                    });
                    lead.reminder3Sent = true;
                    await lead.save();
                    emailsSent++;
                }
                // 1-day reminder
                else if (diffDays === 1 && !lead.reminder1Sent) {
                    const timeToEvent = new Date(lead.eventDate) - new Date(lead.createdAt);
                    if (timeToEvent >= 30 * 60 * 1000) {
                        await sendReminderEmail({
                            name: lead.name,
                            email: lead.email,
                            daysLeft: 1,
                            eventDate: lead.eventDate,
                            program: lead.program
                        });
                        lead.reminder1Sent = true;
                        await lead.save();
                        emailsSent++;
                    }
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

    // 2. Pending Payment Alert Job (Runs every 2 minutes)
    // Notifies admin if a user hasn't completed payment after 15 minutes
    cron.schedule('*/2 * * * *', async () => {
        console.log(`⏰ [Scheduler] Running pending payment alert job...`);
        try {
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            
            // Find leads where:
            // - Source includes webinar
            // - Payment is pending
            // - We haven't sent this alert yet
            // - Created more than 15 minutes ago
            const pendingLeads = await Lead.find({
                sources: "webinar",
                paymentStatus: "pending",
                pendingPaymentAlertSent: { $ne: true },
                createdAt: { $lt: fifteenMinutesAgo }
            });

            console.log(`🔍 [Scheduler] Found ${pendingLeads.length} leads with pending payments older than 15 mins.`);

            for (const lead of pendingLeads) {
                try {
                    sendPendingPaymentAdminEmail({
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        source: "webinar",
                        registrationTime: lead.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                        program: lead.program
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

    // 3. 30-Minute Reminder Job (Runs every 2 minutes)
    cron.schedule('*/2 * * * *', async () => {
        console.log(`⏰ [Scheduler] Running 30-minute reminder job...`);
        try {
            const now = new Date();
            const upperLimit = new Date(now.getTime() + 35 * 60 * 1000); // 35 minutes from now

            // Find verified, paid leads whose event date is within the next 35 minutes
            // and who haven't received their 30-minute reminder yet.
            const leads = await Lead.find({
                isVerified: true,
                paymentStatus: "paid",
                reminder30MinSent: { $ne: true },
                eventDate: { 
                    $gte: new Date(now.getTime() - 5 * 60 * 1000), // event is either about to start or started at most 5 mins ago
                    $lte: upperLimit 
                }
            });

            console.log(`🔍 [Scheduler] Found ${leads.length} leads eligible for 30-minute reminder.`);

            for (const lead of leads) {
                try {
                    await sendReminderEmail({
                        name: lead.name,
                        email: lead.email,
                        minutesLeft: 30,
                        eventDate: lead.eventDate,
                        program: lead.program
                    });
                    
                    lead.reminder30MinSent = true;
                    await lead.save();
                    console.log(`✅ [Scheduler] Sent 30-minute reminder to: ${maskEmail(lead.email)}`);
                } catch (sendErr) {
                    console.error(`❌ Failed to send 30-minute reminder for ${lead.email}:`, sendErr.message);
                }
            }
        } catch (error) {
            console.error('❌ Error running 30-minute reminder job:', error);
        }
    });

    console.log('🗓️  Scheduler initialized.');
    console.log('   - Daily reminder job: 9:00 AM IST');
    console.log('   - Pending payment alerts: Every 2 minutes (for >15 min delay)');
    console.log('   - 30-minute reminders: Every 2 minutes');
};
