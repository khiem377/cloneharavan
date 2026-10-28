const { getStoreEmailConfig, createTransporter, sendEmail } = require('./config');
const { EMAIL_TEMPLATES_CONFIG, renderEmailTemplate } = require('./templates');
const {
  resolveCustomerInfo,
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendAbandonedCheckoutEmail,
  sendOrderCancelledEmail,
  sendOrderRefundedEmail,
  sendOrderEditedEmail,
  sendShippingConfirmationEmail,
  sendShippingDeliveredEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendAdminLoginOtpEmail,
  sendPurchaseOrderEmail,
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

  // Tiện ích giải quyết thông tin người nhận
  resolveCustomerInfo,

  // Nghiệp vụ gửi mail (12 mẫu Sapo / AMIS)
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendAbandonedCheckoutEmail,
  sendOrderCancelledEmail,
  sendOrderRefundedEmail,
  sendOrderEditedEmail,
  sendShippingConfirmationEmail,
  sendShippingDeliveredEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendAdminLoginOtpEmail,
  sendPurchaseOrderEmail,
  sendTestNotificationEmail,
};
