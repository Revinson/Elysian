const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (text)
 * @param {string} [options.html] - Email body (HTML)
 * @returns {Promise} - Nodemailer info object
 */
const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define email options
  const mailOptions = {
    from: `Elysium <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Add HTML if provided
  if (options.html) {
    mailOptions.html = options.html;
  }

  // 3) Send email
  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;