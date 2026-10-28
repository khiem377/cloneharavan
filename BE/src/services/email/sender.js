const { getStoreEmailConfig, sendEmail } = require('./config');
const { renderEmailTemplate } = require('./templates');

/**
 * Kiểm tra địa chỉ email hợp lệ (tự động loại trừ trường hợp đăng nhập Zalo, TikTok hoặc SĐT không có email)
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  if (
    !clean ||
    !clean.includes('@') ||
    clean.endsWith('.local') ||
    clean.includes('@zalo.') ||
    clean.includes('@tiktok.')
  ) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
};

/**
 * Trích xuất email và tên khách hàng từ đơn hàng, tự động fallback truy vấn DB nếu userId là ObjectId
 */
const resolveCustomerInfo = async (order) => {
  if (!order) return { email: null, name: 'Quý khách' };

  let email = order.shippingAddress?.email || order.customerEmail;
  let name = order.shippingAddress?.fullName || order.customerName;

  if (order.userId && typeof order.userId === 'object') {
    if (!email) email = order.userId.email;
    if (!name) name = order.userId.fullName || order.userId.name;
  }

  if ((!email || !name) && order.userId) {
    try {
      const User = require('../../models/user.model');
      const u = await User.findById(order.userId).select('email fullName name');
      if (u) {
        if (!email) email = u.email;
        if (!name) name = u.fullName || u.name;
      }
    } catch (_) {}
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const validEmail = isValidEmail(cleanEmail) ? cleanEmail : null;

  return {
    email: validEmail,
    name: (name || 'Quý khách').trim(),
  };
};

/**
 * 1. Gửi email xác nhận đơn hàng cho khách (order_confirmation)
 */
const sendOrderConfirmationEmail = async (order) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.order_confirmation === false) return null;

  const { email: customerEmail, name: customerName } = await resolveCustomerInfo(order);
  // Tài khoản đăng nhập mạng xã hội (Zalo, TikTok, SĐT...) không có email -> Tự động bỏ qua không gửi
  if (!customerEmail) return null;

  const { subject, html } = await renderEmailTemplate('order_confirmation', {
    order,
    customerName,
    customerEmail,
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Cảm ơn bạn đã đặt hàng #${order.orderCode} tại ${config.shopName}.`,
  });
};

/**
 * 2. Gửi email xác nhận thanh toán thành công (payment_success)
 */
const sendPaymentSuccessEmail = async (order, transactionId = '') => {
  const config = await getStoreEmailConfig();
  if (config.triggers.payment_success === false) return null;

  const { email: customerEmail, name: customerName } = await resolveCustomerInfo(order);
  if (!customerEmail) return null;

  const { subject, html } = await renderEmailTemplate('payment_success', {
    order,
    customerName,
    customerEmail,
    transactionId: transactionId || order.paymentDetails?.transactionNo || 'DIRECT-PAID',
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Đơn hàng #${order.orderCode} tại ${config.shopName} đã được thanh toán thành công.`,
  });
};

/**
 * 3. Gửi email hoàn tất đơn hàng / Giỏ hàng bỏ quên (abandoned_checkout)
 */
const sendAbandonedCheckoutEmail = async (cart, user, checkoutUrl = '') => {
  const config = await getStoreEmailConfig();
  if (config.triggers.abandoned_checkout === false) return null;

  const email = user?.email;
  if (!email) return null;

  const customerName = user?.fullName || user?.name || 'bạn';
  const { subject, html } = await renderEmailTemplate('abandoned_checkout', {
    order: cart,
    customerName,
    checkoutUrl,
  });

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Bạn có sản phẩm chưa thanh toán trong giỏ hàng tại ${config.shopName}.`,
  });
};

/**
 * 4. Gửi email thông báo hủy đơn hàng (order_cancelled)
 */
const sendOrderCancelledEmail = async (order, reason = '') => {
  const config = await getStoreEmailConfig();
  if (config.triggers.order_cancelled === false) return null;

  const { email: customerEmail, name: customerName } = await resolveCustomerInfo(order);
  if (!customerEmail) return null;

  const { subject, html } = await renderEmailTemplate('order_cancelled', {
    order,
    customerName,
    reason: reason || order.cancelReason || 'Theo yêu cầu của khách hàng hoặc hết hàng',
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Đơn hàng #${order.orderCode} tại ${config.shopName} đã được hủy bỏ.`,
  });
};

/**
 * 5. Gửi email xác nhận hoàn trả / hoàn tiền (order_refunded)
 */
const sendOrderRefundedEmail = async (order, refundAmount = null) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.order_refunded === false) return null;

  const { email: customerEmail, name: customerName } = await resolveCustomerInfo(order);
  if (!customerEmail) return null;

  const { subject, html } = await renderEmailTemplate('order_refunded', {
    order,
    customerName,
    refundAmount: refundAmount || order.pricing?.totalAmount || 0,
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Đơn hàng #${order.orderCode} đã được hoàn tiền thành công.`,
  });
};

/**
 * 6. Gửi email cập nhật đơn hàng (order_edited)
 */
const sendOrderEditedEmail = async (order) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.order_edited === false) return null;

  const { email: customerEmail, name: customerName } = await resolveCustomerInfo(order);
  if (!customerEmail) return null;

  const { subject, html } = await renderEmailTemplate('order_edited', {
    order,
    customerName,
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Đơn hàng #${order.orderCode} tại ${config.shopName} đã có thông tin cập nhật mới.`,
  });
};

/**
 * 7. Gửi email xác nhận giao vận / bắt đầu giao (shipping_confirmation)
 */
const sendShippingConfirmationEmail = async (order, shipment = {}) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.shipping_confirmation === false) return null;

  const { email: customerEmail, name: customerName } = await resolveCustomerInfo(order);
  if (!customerEmail) return null;

  const trackingCode = shipment.trackingCode || shipment.shipmentCode || 'SHIP-AUTO';
  const carrierName = shipment.carrierName || order.shippingMethod || 'Đối tác giao nhận';
  const trackingUrl = shipment.trackingUrl || '';

  const { subject, html } = await renderEmailTemplate('shipping_confirmation', {
    order,
    customerName,
    trackingCode,
    carrierName,
    trackingUrl,
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Đơn hàng #${order.orderCode} đang trên đường giao bởi ${carrierName}. Mã vận đơn: ${trackingCode}`,
  });
};

/**
 * 8. Gửi email thông báo giao hàng thành công (shipping_delivered)
 */
const sendShippingDeliveredEmail = async (order, shipment = {}) => {
  const config = await getStoreEmailConfig();
  if (config.triggers.shipping_delivered === false) return null;

  const { email: customerEmail, name: customerName } = await resolveCustomerInfo(order);
  if (!customerEmail) return null;

  const { subject, html } = await renderEmailTemplate('shipping_delivered', {
    order,
    customerName,
    carrierName: shipment.carrierName || 'Nhân viên giao nhận',
  });

  return sendEmail({
    to: customerEmail,
    subject,
    html,
    text: `Đơn hàng #${order.orderCode} đã được giao thành công tới bạn. Cảm ơn bạn đã mua hàng!`,
  });
};

/**
 * 9. Gửi email đặt lại mật khẩu cho khách (reset_password)
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
 * 10. Gửi email xác minh tài khoản cho khách (verify_email)
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
 * 11. Gửi email OTP đăng nhập Quản trị viên (2FA) (admin_login_otp)
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
 * 12. Gửi email đơn đặt hàng mua cho Nhà cung cấp (purchase_order)
 */
const sendPurchaseOrderEmail = async (po, recipientEmail, subjectText = '', customNote = '') => {
  const config = await getStoreEmailConfig();
  if (config.triggers.purchase_order === false) return null;

  const toEmail = recipientEmail || po?.supplierId?.email;
  if (!toEmail) return null;

  const { subject, html } = await renderEmailTemplate('purchase_order', {
    po,
    supplier: po?.supplierId || {},
    customNote,
    subjectText,
  });

  return sendEmail({
    to: toEmail,
    subject: subjectText || subject,
    html,
    text: `Đơn đặt hàng #${po?.poNumber || ''} từ ${config.shopName}`,
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
};
