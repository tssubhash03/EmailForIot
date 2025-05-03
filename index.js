require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
app.use(express.json()); // To parse JSON body

// ✅ Configure CORS to allow requests from any origin or a specific origin
const allowedOrigins = ['http://192.168.56.1:51840'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy does not allow access from this origin'));
    }
  }
}));

// POST route to send email
app.post('/send-email', async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject || !htmlContent) {
    return res.status(400).json({ error: 'to, subject, and htmlContent are required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
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
    res.status(200).json({ message: '✅ Email sent successfully', info: info.response });
  } catch (err) {
    console.error('❌ Error sending email:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  console.log('GET request received at /');
  res.status(200).json({});
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
