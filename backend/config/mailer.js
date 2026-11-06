const nodemailer = require('nodemailer');

let transporter = null;

function getMailerTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass }
    });
  } else {
    // Development fallback mock transporter
    transporter = {
      sendMail: async (options) => {
        console.log(`[EMAIL NOTIFICATION SENT] To: ${options.to} | Subject: "${options.subject}"`);
        return { messageId: 'mock-' + Date.now(), response: '250 Mock Sent' };
      }
    };
  }

  return transporter;
}

async function sendNotificationEmail(to, subject, htmlBody) {
  try {
    const t = getMailerTransporter();
    return await t.sendMail({
      from: `"BloodBridge Platform" <${process.env.SMTP_FROM || 'noreply@bloodbridge.org'}>`,
      to,
      subject,
      html: htmlBody
    });
  } catch (error) {
    console.error('Failed to send notification email:', error.message);
    return null;
  }
}

module.exports = { getMailerTransporter, sendNotificationEmail };
