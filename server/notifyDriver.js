// Simple Express API endpoint for sending driver notification emails
// Install nodemailer: npm install nodemailer

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure your email transport (use your real credentials in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your.email@gmail.com',
    pass: 'your_app_password'
  }
});

router.post('/api/notify-driver', async (req, res) => {
  const { driverEmail, subject, message } = req.body;
  if (!driverEmail || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await transporter.sendMail({
      from: 'your.email@gmail.com',
      to: driverEmail,
      subject,
      text: message
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
