// Enhanced driver notification system with scheduling
// Dependencies: express, nodemailer, node-cron
const express = require('express');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const router = express.Router();

// In-memory storage for scheduled reminders (in production, use a database)
const scheduledReminders = new Map();

// Configurable reminder delay (in hours before pickup)
const REMINDER_HOURS_BEFORE_PICKUP = process.env.REMINDER_HOURS_BEFORE_PICKUP || 1;

// Configure your email transport (use your real credentials in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your.email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
});

// Helper function to send email
async function sendEmail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your.email@gmail.com',
      to,
      subject,
      text: message
    });
    console.log(`Email sent successfully to ${to}: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to calculate reminder time
function calculateReminderTime(pickupDateTime) {
  const pickup = new Date(pickupDateTime);
  const reminderTime = new Date(pickup.getTime() - (REMINDER_HOURS_BEFORE_PICKUP * 60 * 60 * 1000));
  return reminderTime;
}

// Helper function to format datetime for cron
function toCronFormat(date) {
  return `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
}

// Route for immediate driver notification (confirmation email)
router.post('/api/notify-driver', async (req, res) => {
  const { driverEmail, subject, message } = req.body;
  
  if (!driverEmail || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields: driverEmail, subject, message' });
  }
  
  try {
    const result = await sendEmail(driverEmail, subject, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route for booking confirmation with automatic reminder scheduling
router.post('/api/confirm-booking', async (req, res) => {
  const { 
    bookingId, 
    driverEmail, 
    driverName, 
    customer, 
    pickup, 
    destination, 
    pickupDateTime,
    bookingType = 'transfer'
  } = req.body;
  
  if (!bookingId || !driverEmail || !driverName || !customer || !pickup || !destination || !pickupDateTime) {
    return res.status(400).json({ 
      error: 'Missing required fields: bookingId, driverEmail, driverName, customer, pickup, destination, pickupDateTime' 
    });
  }
  
  try {
    // 1. Send confirmation email immediately
    const confirmationSubject = `Booking Confirmed: ${pickup} → ${destination}`;
    const confirmationMessage = `Dear ${driverName},

Your booking has been confirmed!

Booking Details:
- Customer: ${customer}
- Type: ${bookingType}
- Pickup: ${pickup}
- Destination: ${destination}
- Date & Time: ${new Date(pickupDateTime).toLocaleString()}

Please be ready at the pickup location on time.

Best regards,
Priority Transfers Team`;

    const confirmationResult = await sendEmail(driverEmail, confirmationSubject, confirmationMessage);
    
    if (!confirmationResult.success) {
      return res.status(500).json({ 
        error: 'Failed to send confirmation email',
        details: confirmationResult.error 
      });
    }

    // 2. Schedule reminder email
    const reminderTime = calculateReminderTime(pickupDateTime);
    const now = new Date();
    
    // Only schedule reminder if it's in the future
    if (reminderTime > now) {
      const cronExpression = toCronFormat(reminderTime);
      
      // Create reminder task
      const task = cron.schedule(cronExpression, async () => {
        const reminderSubject = `Pickup Reminder: ${pickup} → ${destination}`;
        const reminderMessage = `Dear ${driverName},

This is a friendly reminder about your upcoming booking:

Booking Details:
- Customer: ${customer}
- Type: ${bookingType}
- Pickup: ${pickup}
- Destination: ${destination}
- Pickup Time: ${new Date(pickupDateTime).toLocaleString()}

Please prepare to depart soon. The pickup is in ${REMINDER_HOURS_BEFORE_PICKUP} hour(s).

Safe travels!
Priority Transfers Team`;

        const result = await sendEmail(driverEmail, reminderSubject, reminderMessage);
        console.log(`Reminder sent for booking ${bookingId}:`, result);
        
        // Clean up the scheduled task
        scheduledReminders.delete(bookingId);
        task.destroy();
      }, {
        scheduled: false
      });
      
      // Store the task for potential cancellation
      scheduledReminders.set(bookingId, {
        task,
        reminderTime: reminderTime.toISOString(),
        driverEmail,
        driverName
      });
      
      // Start the task
      task.start();
      
      console.log(`Scheduled reminder for booking ${bookingId} at ${reminderTime.toISOString()}`);
    }

    res.json({ 
      success: true, 
      message: 'Confirmation email sent and reminder scheduled',
      confirmationSent: true,
      reminderScheduled: reminderTime > now,
      reminderTime: reminderTime > now ? reminderTime.toISOString() : null
    });
    
  } catch (err) {
    console.error('Error in confirm-booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route to cancel a scheduled reminder
router.delete('/api/cancel-reminder/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  
  if (scheduledReminders.has(bookingId)) {
    const reminderData = scheduledReminders.get(bookingId);
    reminderData.task.destroy();
    scheduledReminders.delete(bookingId);
    
    res.json({ 
      success: true, 
      message: `Reminder cancelled for booking ${bookingId}` 
    });
  } else {
    res.status(404).json({ 
      error: `No scheduled reminder found for booking ${bookingId}` 
    });
  }
});

// Route to get all scheduled reminders
router.get('/api/scheduled-reminders', (req, res) => {
  const reminders = Array.from(scheduledReminders.entries()).map(([bookingId, data]) => ({
    bookingId,
    reminderTime: data.reminderTime,
    driverEmail: data.driverEmail,
    driverName: data.driverName
  }));
  
  res.json({ reminders });
});

// Route to test email configuration
router.post('/api/test-email', async (req, res) => {
  const { testEmail } = req.body;
  
  if (!testEmail) {
    return res.status(400).json({ error: 'testEmail is required' });
  }
  
  try {
    const result = await sendEmail(
      testEmail,
      'Priority Transfers Email Test',
      'This is a test email to verify your email configuration is working correctly.'
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;