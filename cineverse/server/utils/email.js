const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Moovz" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// Build a nice HTML email for password reset
const sendResetEmail = async (email, resetUrl) => {
  const html = `
    <div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;background:#0a0a0f;color:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#E50000,#FF6B00);padding:30px;text-align:center;">
        <h1 style="margin:0;font-size:28px;">🎬 Moovz</h1>
        <p style="margin:6px 0 0;opacity:0.9;font-size:14px;">Password Reset</p>
      </div>
      <div style="padding:30px;">
        <p style="font-size:16px;line-height:1.6;color:#cccccc;">
          Hi there! We received a request to reset your password. Click the button below to create a new one:
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="background:linear-gradient(135deg,#E50000,#FF6B00);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size:13px;color:#888888;line-height:1.5;">
          This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #222;margin:24px 0;">
        <p style="font-size:12px;color:#666;text-align:center;">
          Moovz — Your universe of movies & TV shows
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: '🔐 Moovz — Reset Your Password',
    html,
  });
};

module.exports = { sendEmail, sendResetEmail };
