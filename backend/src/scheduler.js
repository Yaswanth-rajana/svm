import cron from 'node-cron';
import Lead from './models/Lead.js';
import { sendReminderEmail } from './services/reminderService.js';

/**
 * Initializes the cron jobs for the application.
 */
export const initScheduler = () => {
    // Run every day at 9:00 AM IST
    // IST is UTC+5:30. 9:00 AM IST = 3:30 AM UTC
    cron.schedule('* * * * *', async () => {
        console.log(`⏰ [PID: ${process.pid}] Running daily reminder job at 9:00 AM IST...`);
        try {
            // Find all verified leads who have completed payment
            const leads = await Lead.find({ 
              isVerified: true,
              paymentStatus: "paid" 
            });

            console.log(`🔍 [Scheduler] Query found ${leads.length} leads with paymentStatus: "paid"`);
            
            let emailsSent = 0;

            for (const lead of leads) {
                // Internal Safety Check
                if (lead.paymentStatus !== "paid") {
                    console.log(`⚠️ [Scheduler] ERROR: Query returned non-paid lead: ${lead.email} (${lead.paymentStatus}). Skipping.`);
                    continue;
                }

                if (!lead.eventDate) continue;
                
                console.log(`⚙️ [Scheduler] Processing lead: ${lead.email}`);

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

    console.log('🗓️  Scheduler initialized. Daily reminder job scheduled for 9:00 AM IST.');
};
