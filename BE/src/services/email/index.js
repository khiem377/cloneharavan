const { getStoreEmailConfig, createTransporter, sendEmail } = require('./config');
const { EMAIL_TEMPLATES_CONFIG, renderEmailTemplate } = require('./templates');
const {
  sendOrderConfirmationEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendAdminLoginOtpEmail,
  sendTestNotificationEmail,
} = require('./sender');

module.exports = {
  // Transporter & cấu hình
  sendEmail,
  createTransporter,
  getStoreEmailConfig,

  // Render & Template metadata
  EMAIL_TEMPLATES_CONFIG,
  renderEmailTemplate,

  // Nghiệp vụ gửi mail
  sendOrderConfirmationEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendAdminLoginOtpEmail,
  sendTestNotificationEmail,
};
