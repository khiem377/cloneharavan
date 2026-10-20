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
  const emailService = require('../services/email.service');
  const StoreSetting = require('../models/storeSetting.model');
  const { maskSecret } = require('../utils/crypto.util');
  const setting = await StoreSetting.getSingleton();

  const customTemplates = setting.notificationSettings?.customTemplates || {};
  const smtpConfig = setting.notificationSettings?.smtpConfig || {};

  res.status(200).json({
    success: true,
    data: {
      templates: emailService.EMAIL_TEMPLATES_CONFIG.map((t) => ({
        id: t.id,
        group: t.group,
        name: t.name,
        description: t.description,
        defaultSubject: t.defaultSubject,
        enabled: setting.notificationSettings?.emailTriggers?.[t.id] ?? true,
        isCustomized: Boolean(customTemplates[t.id]?.isCustomized),
      })),
      branding: {
        logoUrl: setting.notificationSettings?.emailBranding?.logoUrl || setting.storeInfo?.logo || '',
        logoWidth: setting.notificationSettings?.emailBranding?.logoWidth || 180,
        primaryColor: setting.notificationSettings?.emailBranding?.primaryColor || '#0088ff',
      },
      smtpConfig: {
        host: smtpConfig.host || process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(smtpConfig.port) || Number(process.env.EMAIL_PORT) || 587,
        secure: smtpConfig.secure !== undefined ? Boolean(smtpConfig.secure) : (Number(smtpConfig.port || process.env.EMAIL_PORT) === 465),
        user: smtpConfig.user || process.env.EMAIL_USER || '',
        pass: (smtpConfig.pass || process.env.EMAIL_PASS) ? maskSecret(smtpConfig.pass || process.env.EMAIL_PASS) : '',
        hasPassword: Boolean(smtpConfig.pass || process.env.EMAIL_PASS),
        fromName: smtpConfig.fromName || setting.storeInfo?.name || process.env.SHOP_NAME || 'Dak Shop',
      },
      storeInfo: {
        name: setting.storeInfo?.name || 'Dak Shop',
        logo: setting.storeInfo?.logo || '',
      },
    },
  });
});

// Lấy thông tin chi tiết của 1 mẫu email để mở form chỉnh sửa trực quan
const getTemplateDetail = catchAsync(async (req, res) => {
  const { templateId } = req.params;
  const emailService = require('../services/email.service');
  const StoreSetting = require('../models/storeSetting.model');
  const setting = await StoreSetting.getSingleton();

  const customConfig = (setting.notificationSettings?.customTemplates?.[templateId]) || null;
  const preview = await emailService.renderEmailTemplate(templateId, {});

  res.status(200).json({
    success: true,
    data: {
      template: {
        id: preview.template.id,
        group: preview.template.group,
        name: preview.template.name,
        description: preview.template.description,
      },
      defaults: preview.defaults || {},
      availableVariables: preview.availableVariables || [],
      custom: customConfig,
      preview: {
        subject: preview.subject,
        html: preview.html,
      },
    },
  });
});

// Lưu tùy chỉnh trực quan cho 1 mẫu email
const saveCustomTemplate = catchAsync(async (req, res) => {
  const { templateId } = req.params;
  const { subject, greetingMessage, specialNote, ctaText, footerNote } = req.body;
  const StoreSetting = require('../models/storeSetting.model');
  const setting = await StoreSetting.getSingleton();

  if (!setting.notificationSettings) {
    setting.notificationSettings = {};
  }
  if (!setting.notificationSettings.customTemplates) {
    setting.notificationSettings.customTemplates = {};
  }

  setting.notificationSettings.customTemplates[templateId] = {
    subject: (subject || '').trim(),
    greetingMessage: (greetingMessage || '').trim(),
    specialNote: (specialNote || '').trim(),
    ctaText: (ctaText || '').trim(),
    footerNote: (footerNote || '').trim(),
    isCustomized: true,
    updatedAt: new Date(),
  };

  setting.markModified('notificationSettings.customTemplates');
  setting.updatedBy = req.user?._id;
  await setting.save();

  res.status(200).json({
    success: true,
    message: 'Lưu nội dung tùy chỉnh mẫu email thành công',
    data: setting.notificationSettings.customTemplates[templateId],
  });
});

// Khôi phục 1 mẫu email về template mặc định ban đầu
const resetCustomTemplate = catchAsync(async (req, res) => {
  const { templateId } = req.params;
  const StoreSetting = require('../models/storeSetting.model');
  const setting = await StoreSetting.getSingleton();

  if (setting.notificationSettings?.customTemplates?.[templateId]) {
    delete setting.notificationSettings.customTemplates[templateId];
    setting.markModified('notificationSettings.customTemplates');
    setting.updatedBy = req.user?._id;
    await setting.save();
  }

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
  const StoreSetting = require('../models/storeSetting.model');
  const setting = await StoreSetting.getSingleton();
  const { emailBranding, emailTriggers } = req.body;

  setting.notificationSettings = {
    ...(setting.notificationSettings?.toObject?.() || {}),
    emailBranding: {
      ...(setting.notificationSettings?.emailBranding?.toObject?.() || {}),
      ...(emailBranding || {}),
    },
    emailTriggers: {
      ...(setting.notificationSettings?.emailTriggers?.toObject?.() || {}),
      ...(emailTriggers || {}),
    },
  };

  setting.updatedBy = req.user?._id;
  await setting.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật cấu hình thông báo email thành công',
    data: setting.notificationSettings,
  });
});

// Cập nhật cấu hình máy chủ gửi thư SMTP riêng
const updateSmtpConfig = catchAsync(async (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail, isEnabled } = req.body;
  const StoreSetting = require('../models/storeSetting.model');
  const { encrypt } = require('../utils/crypto.util');
  const setting = await StoreSetting.getSingleton();

  if (!setting.notificationSettings) {
    setting.notificationSettings = {};
  }
  const currentSmtp = setting.notificationSettings.smtpConfig || {};

  let finalPass = currentSmtp.pass || '';
  if (pass && !pass.includes('•••')) {
    finalPass = encrypt(pass);
  }

  const targetPort = Number(port) || 587;
  setting.notificationSettings.smtpConfig = {
    host: (host || 'smtp.gmail.com').trim(),
    port: targetPort,
    secure: secure !== undefined ? Boolean(secure) : targetPort === 465,
    user: (user || '').trim(),
    pass: finalPass,
    fromName: (fromName || '').trim(),
    fromEmail: (user || '').trim(),
    isEnabled: true,
  };

  setting.markModified('notificationSettings.smtpConfig');
  setting.updatedBy = req.user?._id;
  await setting.save();

  res.status(200).json({
    success: true,
    message: 'Lưu cấu hình máy chủ SMTP thành công',
    data: {
      ...setting.notificationSettings.smtpConfig.toObject(),
      pass: '••••••••',
    },
  });
});

// Kiểm tra kết nối SMTP (Handshake test & gửi mail thử nghiệm)
const testSmtpConfig = catchAsync(async (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail, targetEmail } = req.body;
  const emailService = require('../services/email.service');
  const StoreSetting = require('../models/storeSetting.model');
  const { decrypt } = require('../utils/crypto.util');
  const setting = await StoreSetting.getSingleton();

  let actualPass = pass;
  if (!actualPass || actualPass.includes('•••')) {
    actualPass = decrypt(setting.notificationSettings?.smtpConfig?.pass) || setting.notificationSettings?.smtpConfig?.pass;
  }

  if (!actualPass) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu ứng dụng SMTP để kiểm tra' });
  }

  const result = await emailService.testSmtpConnection({
    host: host || setting.notificationSettings?.smtpConfig?.host || 'smtp.gmail.com',
    port: port || setting.notificationSettings?.smtpConfig?.port || 587,
    secure: secure !== undefined ? secure : setting.notificationSettings?.smtpConfig?.secure,
    user: user || setting.notificationSettings?.smtpConfig?.user,
    pass: actualPass,
    fromName: fromName || setting.notificationSettings?.smtpConfig?.fromName,
    fromEmail: fromEmail || setting.notificationSettings?.smtpConfig?.fromEmail,
    targetEmail,
  });

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
