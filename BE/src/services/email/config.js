const nodemailer = require('nodemailer');
const StoreSetting = require('../../models/storeSetting.model');
const { encrypt, decrypt, maskSecret } = require('../../utils/crypto.util');

/**
 * Lấy cấu hình email và thương hiệu động từ StoreSetting
 */
const getStoreEmailConfig = async () => {
  try {
    const setting = await StoreSetting.getSingleton();
    const name = setting?.storeInfo?.name || setting?.storeInfo?.businessName || process.env.SHOP_NAME || 'Dak Shop';
    const email = setting?.storeInfo?.supportEmail || setting?.storeInfo?.adminEmail || process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || 'support@dakshop.vn';
    const branding = setting?.notificationSettings?.emailBranding || {};
    const triggers = setting?.notificationSettings?.emailTriggers || {};
    const smtpConfig = setting?.notificationSettings?.smtpConfig || {};
    const customTemplates = setting?.notificationSettings?.customTemplates || {};

    let decryptedPass = '';
    if (smtpConfig.pass) {
      try {
        decryptedPass = decrypt(smtpConfig.pass) || smtpConfig.pass;
      } catch {
        decryptedPass = smtpConfig.pass;
      }
    }

    return {
      shopName: name,
      supportEmail: email,
      logoUrl: branding.logoUrl || setting?.storeInfo?.logo || '',
      logoWidth: Number(branding.logoWidth) || 180,
      primaryColor: branding.primaryColor || '#0088ff',
      triggers,
      customTemplates,
      smtpConfig: {
        host: smtpConfig.host || 'smtp.gmail.com',
        port: Number(smtpConfig.port) || 587,
        secure: Boolean(smtpConfig.secure),
        user: smtpConfig.user || '',
        pass: decryptedPass,
        fromName: smtpConfig.fromName || name,
        fromEmail: smtpConfig.fromEmail || email,
        isEnabled: Boolean(smtpConfig.isEnabled),
      },
    };
  } catch (err) {
    return {
      shopName: process.env.SHOP_NAME || 'Dak Shop',
      supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || 'support@dakshop.vn',
      logoUrl: '',
      logoWidth: 180,
      primaryColor: '#0088ff',
      triggers: {},
      customTemplates: {},
      smtpConfig: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: '',
        pass: '',
        fromName: 'Dak Shop',
        fromEmail: 'support@dakshop.vn',
        isEnabled: false,
      },
    };
  }
};

/**
 * Khởi tạo Nodemailer Transporter
 * Ưu tiên: 1. Custom SMTP truyền vào -> 2. Cấu hình SMTP trong StoreSetting (nếu isEnabled) -> 3. Fallback .env
 */
const createTransporter = async (overrideSmtp = null) => {
  if (overrideSmtp && overrideSmtp.user && overrideSmtp.pass) {
    return nodemailer.createTransport({
      host: overrideSmtp.host || 'smtp.gmail.com',
      port: Number(overrideSmtp.port) || 587,
      secure: Boolean(overrideSmtp.secure),
      auth: {
        user: overrideSmtp.user,
        pass: overrideSmtp.pass,
      },
    });
  }

  const { smtpConfig } = await getStoreEmailConfig();
  if (smtpConfig?.user && smtpConfig?.pass) {
    return nodemailer.createTransport({
      host: smtpConfig.host || 'smtp.gmail.com',
      port: Number(smtpConfig.port) || 587,
      secure: Boolean(smtpConfig.secure),
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });
  }

  // Tự động đồng bộ từ .env vào DB nếu trong DB chưa cấu hình lần nào
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const StoreSetting = require('../../models/storeSetting.model');
      const { encrypt } = require('../../utils/crypto.util');
      const setting = await StoreSetting.getSingleton();
      if (!setting.notificationSettings) setting.notificationSettings = {};
      setting.notificationSettings.smtpConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        pass: encrypt(process.env.EMAIL_PASS),
        fromName: setting.storeInfo?.name || 'Dak Shop',
        fromEmail: process.env.EMAIL_USER,
        isEnabled: true,
      };
      setting.markModified('notificationSettings.smtpConfig');
      await setting.save();

      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } catch (e) {
      console.warn('Lỗi tự động khởi tạo SMTP từ .env:', e.message);
    }
  }

  return null;
};

/**
 * Gửi email chung qua SMTP hoặc log console trong Dev Mode
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const { shopName, smtpConfig } = await getStoreEmailConfig();
  const transporter = await createTransporter();

  const fromName = smtpConfig?.fromName || shopName;
  const fromEmail = smtpConfig?.fromEmail || smtpConfig?.user || process.env.EMAIL_USER || 'noreply@dakshop.vn';
  const from = `"${fromName}" <${fromEmail}>`;

  if (transporter) {
    return transporter.sendMail({ from, to, subject, text, html });
  }

  console.log('\n================== [EMAIL SERVICE (DEV MODE)] ==================');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || html}`);
  console.log('=================================================================\n');

  return { message: 'Email logged to console (SMTP credentials not configured)' };
};

/**
 * Kiểm tra kết nối SMTP (Handshake test & gửi mail thử nghiệm)
 */
const testSmtpConnection = async ({ host, port, secure, user, pass, fromName, fromEmail, targetEmail }) => {
  if (!user || !pass) {
    throw new Error('Vui lòng nhập Email tài khoản và Mật khẩu ứng dụng SMTP');
  }

  const transporter = nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: Number(port) || 587,
    secure: Boolean(secure),
    auth: { user, pass },
  });

  // 1. Xác thực thông số kết nối (Handshake)
  await transporter.verify();

  // 2. Tự động gửi thư kiểm thử cho chính tài khoản gửi (hoặc targetEmail nếu chỉ định)
  const recipient = targetEmail || user;
  const senderEmail = fromEmail || user;
  const sender = `"${fromName || 'Cửa hàng'}" <${senderEmail}>`;

  await transporter.sendMail({
    from: sender,
    to: recipient,
    subject: `[TEST SMTP] Kiểm tra kết nối máy chủ email thành công`,
    text: `Xin chào! Kết nối máy chủ SMTP (${host}:${port}) với tài khoản ${user} đã được thiết lập thành công.`,
    html: `
      <div style="font-family:sans-serif;padding:20px;border:1px solid #e4e4e7;border-radius:6px;max-width:500px;margin:0 auto;">
        <h3 style="color:#059669;margin-top:0;">Xác thực máy chủ SMTP thành công!</h3>
        <p style="color:#3f3f46;font-size:14px;line-height:1.6;">
          Hệ thống đã kết nối thành công đến máy chủ <strong>${host}:${port}</strong> bằng tài khoản <strong>${user}</strong>.
        </p>
        <p style="color:#71717a;font-size:12px;margin-bottom:0;">
          Email thử nghiệm được gửi từ trang Cài đặt Quản trị.
        </p>
      </div>
    `,
  });

  return {
    success: true,
    message: `Kết nối máy chủ SMTP ${host}:${port} thành công! Đã gửi thư kiểm tra tới ${recipient}`,
  };
};

module.exports = {
  getStoreEmailConfig,
  createTransporter,
  sendEmail,
  testSmtpConnection,
};
