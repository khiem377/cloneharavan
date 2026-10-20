const { getStoreEmailConfig, sendEmail } = require('./config');
const { renderEmailTemplate } = require('./templates');

/**
 * Gửi email xác nhận đơn hàng cho khách
 */
const sendOrderConfirmationEmail = async (order) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.order_confirmation === false) {
    return null;
  }

  const customerEmail = order.shippingAddress?.email || order.userId?.email;
  if (!customerEmail) return null;

  const { subject, html } = await renderEmailTemplate('order_confirmation', {
    order,
    customerName: order.shippingAddress?.fullName || 'bạn',
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Cảm ơn bạn đã đặt hàng #${order.orderCode} tại ${config.shopName}.`,
  });
};

/**
 * Gửi email đặt lại mật khẩu cho khách
 */
const sendResetPasswordEmail = async (email, resetToken) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.reset_password === false) return null;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const { subject, html } = await renderEmailTemplate('reset_password', {
    email,
    resetUrl,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Đặt lại mật khẩu: ${resetUrl}`,
  });
};

/**
 * Gửi email xác minh tài khoản cho khách
 */
const sendVerificationEmail = async (email, verifyToken) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.verify_email === false) return null;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${clientUrl}/verify-email?token=${verifyToken}`;

  const { subject, html } = await renderEmailTemplate('verify_email', {
    email,
    verifyUrl,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Xác minh tài khoản: ${verifyUrl}`,
  });
};

/**
 * Gửi email OTP đăng nhập Quản trị viên (2FA)
 */
const sendAdminLoginOtpEmail = async (email, otp) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.admin_login_otp === false) return null;

  const { subject, html } = await renderEmailTemplate('admin_login_otp', {
    email,
    otp,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Mã OTP đăng nhập Admin của bạn là: ${otp}`,
  });
};

/**
 * Gửi email kiểm thử cho Quản trị viên (Send Test Email)
 */
const sendTestNotificationEmail = async (targetEmail, templateId = 'order_confirmation') => {
  const { subject, html } = await renderEmailTemplate(templateId, {});
  const testSubject = `[TEST EMAIL] ${subject}`;
  return sendEmail({
    to: targetEmail,
    subject: testSubject,
    html,
    text: `Đây là email thử nghiệm cho mẫu: ${templateId}`,
  });
};

module.exports = {
  sendOrderConfirmationEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendAdminLoginOtpEmail,
  sendTestNotificationEmail,
};
