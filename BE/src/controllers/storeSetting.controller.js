const catchAsync = require('../utils/catchAsync');
const StoreSettingService = require('../services/storeSetting.service');

// Lấy toàn bộ cấu hình cho Admin
const getStoreSettings = catchAsync(async (req, res) => {
  const settings = await StoreSettingService.getStoreSettings();
  res.status(200).json({
    success: true,
    data: settings,
  });
});

// Lấy cấu hình công khai (Public) cho Storefront & Checkout
const getPublicStoreSettings = catchAsync(async (req, res) => {
  const publicSettings = await StoreSettingService.getPublicStoreSettings();
  res.status(200).json({
    success: true,
    data: publicSettings,
  });
});

// Cập nhật từng phân hệ cấu hình
const updateStoreSettings = catchAsync(async (req, res) => {
  const { section } = req.params;
  const updated = await StoreSettingService.updateStoreSettings(section, req.body, req.user, req);
  res.status(200).json({
    success: true,
    message: `Cập nhật cấu hình ${section} thành công`,
    data: updated,
  });
});

// Lấy danh sách đối tác vận chuyển
const getShippingProviders = catchAsync(async (req, res) => {
  const providers = await StoreSettingService.getShippingProviders();
  res.status(200).json({
    success: true,
    data: providers,
  });
});

// Kết nối đối tác vận chuyển
const connectShippingProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await StoreSettingService.connectShippingProvider(code, req.body, req.user, req);
  res.status(200).json({
    success: true,
    message: `Kết nối đối tác ${result.name} thành công`,
    data: result,
  });
});

// Ngắt kết nối đối tác vận chuyển
const disconnectShippingProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await StoreSettingService.disconnectShippingProvider(code, req.user, req);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// Kiểm tra handshake đối tác vận chuyển
const testShippingProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await StoreSettingService.testShippingProvider(code);
  res.status(200).json({
    success: result.success,
    message: result.message,
  });
});

// Đặt đối tác vận chuyển làm mặc định
const setDefaultShippingProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await StoreSettingService.setDefaultShippingProvider(code, req.user, req);
  res.status(200).json(result);
});

// Lấy danh sách mẫu thông báo email & branding & smtp
const getNotificationTemplates = catchAsync(async (req, res) => {
  const data = await StoreSettingService.getNotificationTemplates();
  res.status(200).json({
    success: true,
    data,
  });
});

// Lấy thông tin chi tiết của 1 mẫu email để mở form chỉnh sửa trực quan
const getTemplateDetail = catchAsync(async (req, res) => {
  const data = await StoreSettingService.getTemplateDetail(req.params.templateId);
  res.status(200).json({
    success: true,
    data,
  });
});

// Lưu tùy chỉnh trực quan cho 1 mẫu email
const saveCustomTemplate = catchAsync(async (req, res) => {
  const data = await StoreSettingService.saveCustomTemplate(req.params.templateId, req.body, req.user?._id);
  res.status(200).json({
    success: true,
    message: 'Lưu nội dung tùy chỉnh mẫu email thành công',
    data,
  });
});

// Khôi phục 1 mẫu email về template mặc định ban đầu
const resetCustomTemplate = catchAsync(async (req, res) => {
  await StoreSettingService.resetCustomTemplate(req.params.templateId, req.user?._id);
  res.status(200).json({
    success: true,
    message: 'Đã khôi phục mẫu email về mặc định ban đầu',
  });
});

// Xem trước trực quan (Live HTML Preview) một mẫu email (hỗ trợ preview custom real-time)
const previewNotificationTemplate = catchAsync(async (req, res) => {
  const { templateId } = req.params;
  const emailService = require('../services/email.service');
  const data = {
    ...req.query,
    customConfig: req.body?.customConfig || undefined,
  };
  const preview = await emailService.renderEmailTemplate(templateId, data);

  res.status(200).json({
    success: true,
    data: preview,
  });
});

// Gửi email thử nghiệm cho quản trị viên
const sendTestNotificationEmail = catchAsync(async (req, res) => {
  const { email, templateId, customConfig } = req.body;
  const emailService = require('../services/email.service');
  const recipientEmail = email || req.user?.email;

  if (!recipientEmail) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email nhận thư thử nghiệm' });
  }

  // Nếu có customConfig truyền từ form đang sửa -> render với customConfig đó
  const { subject, html } = await emailService.renderEmailTemplate(templateId || 'order_confirmation', {
    customConfig,
  });

  const result = await emailService.sendEmail({
    to: recipientEmail,
    subject: `[TEST EMAIL] ${subject}`,
    html,
    text: `Đây là email thử nghiệm cho mẫu: ${templateId}`,
  });

  res.status(200).json({
    success: true,
    message: `Đã gửi email thử nghiệm thành công tới ${recipientEmail}`,
    data: result,
  });
});

// Cập nhật cấu hình thông báo (branding & triggers)
const updateNotificationSettings = catchAsync(async (req, res) => {
  const data = await StoreSettingService.updateNotificationSettings(req.body, req.user?._id);
  res.status(200).json({
    success: true,
    message: 'Cập nhật cấu hình thông báo email thành công',
    data,
  });
});

// Cập nhật cấu hình máy chủ gửi thư SMTP riêng
const updateSmtpConfig = catchAsync(async (req, res) => {
  const data = await StoreSettingService.updateSmtpConfig(req.body, req.user?._id);
  res.status(200).json({
    success: true,
    message: 'Lưu cấu hình máy chủ SMTP thành công',
    data,
  });
});

// Kiểm tra kết nối SMTP (Handshake test & gửi mail thử nghiệm)
const testSmtpConfig = catchAsync(async (req, res) => {
  const result = await StoreSettingService.testSmtpConfig(req.body);
  res.status(200).json(result);
});

module.exports = {
  getStoreSettings,
  getPublicStoreSettings,
  updateStoreSettings,
  getShippingProviders,
  connectShippingProvider,
  disconnectShippingProvider,
  testShippingProvider,
  setDefaultShippingProvider,
  getNotificationTemplates,
  getTemplateDetail,
  saveCustomTemplate,
  resetCustomTemplate,
  previewNotificationTemplate,
  sendTestNotificationEmail,
  updateNotificationSettings,
  updateSmtpConfig,
  testSmtpConfig,
};
