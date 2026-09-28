const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"SHOP Procurement" <hken2628@gmail.com>',
    to,
    subject,
    html,
    text: text || 'Xin chào, vui lòng xem đơn hàng PO trong định dạng HTML.',
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
