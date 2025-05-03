require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json()); // To parse JSON body

// ✅ Define specific allowed origins (for production or known IPs)
const allowedOrigins = [
  'http://192.168.56.1:51840', // example internal IP
  'http://10.1.34.77:3000',
];

// ✅ CORS middleware with dynamic localhost support
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin || // allow mobile apps, curl, etc.
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')
    ) {
      callback(null, true);
    } else {
      callback(new Error('❌ CORS policy does not allow access from this origin: ' + origin));
    }
  }
}));

// ✅ Email sender endpoint
app.post('/send-email', async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject || !htmlContent) {
    return res.status(400).json({ error: 'to, subject, and htmlContent are required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // App-specific password
    },
  });

  const mailOptions = {
    from: `"Subhash" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    res.status(200).json({ message: '✅ Email sent successfully', info: info.response });
  } catch (err) {
    console.error('❌ Error sending email:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Health check route
app.get('/', (req, res) => {
  console.log('GET request received at /');
  res.status(200).json({ message: 'Server is running' });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
