const nodemailer = require('nodemailer');

/**
 * Khởi tạo Nodemailer Transporter
 */
const createTransporter = () => {
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

/**
 * Gửi email chung
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"SHOP" <noreply@shop.com>';

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

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout helper — dùng chung cho reset + verify email
// Inspired by: reallygoodemails.com, Shopify transactional, Postmates
// Rules: solid colors only, border-radius 6px, no gradients, no emoji decoration
// ─────────────────────────────────────────────────────────────────────────────
const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;

const emailShell = ({ shopName, supportEmail, bodyHtml }) => `<!DOCTYPE html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f5">
  <tr><td align="center" style="padding:32px 16px 40px;">

    <!-- CARD -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="max-width:540px;background:#ffffff;border:1px solid #e4e4e7;border-radius:6px;">

      <!-- NAV BAR: logo trái, label phải — giống Shopify / Postmates -->
      <tr>
        <td style="padding:20px 32px;border-bottom:1px solid #f4f4f5;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <span style="font-family:${F};font-size:15px;font-weight:700;color:#09090b;letter-spacing:-0.3px;">${shopName}</span>
              </td>
              <td align="right">
                <span style="font-family:${F};font-size:11px;color:#a1a1aa;letter-spacing:0.3px;text-transform:uppercase;">Thông báo tài khoản</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="padding:32px 32px 28px;">
          ${bodyHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding:16px 32px 20px;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-family:${F};font-size:11px;color:#a1a1aa;line-height:1.7;">
            &copy; ${new Date().getFullYear()} ${shopName} &nbsp;&middot;&nbsp;
            Email tự động, vui lòng không trả lời trực tiếp.<br/>
            Cần hỗ trợ?&nbsp;<a href="mailto:${supportEmail}" style="color:#52525b;text-decoration:underline;">${supportEmail}</a>
          </p>
        </td>
      </tr>

    </table>
    <!-- /CARD -->

  </td></tr>
</table>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// Reset Password Email
// ─────────────────────────────────────────────────────────────────────────────
const sendResetPasswordEmail = async (email, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
  const shopName = process.env.SHOP_NAME || 'SHOP';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || 'support@shop.com';

  const subject = `Đặt lại mật khẩu tài khoản ${shopName}`;

  const bodyHtml = `
    <!-- Headline -->
    <p style="margin:0 0 4px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;line-height:1.25;letter-spacing:-0.4px;">Đặt lại mật khẩu</p>
    <p style="margin:0 0 24px;font-family:${F};font-size:13px;color:#71717a;line-height:1.5;">Yêu cầu được gửi lúc ${new Date().toLocaleString('vi-VN')}</p>

    <hr style="border:none;border-top:1px solid #f4f4f5;margin:0 0 24px;" />

    <!-- Body copy -->
    <p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản gắn với địa chỉ
      <strong style="color:#09090b;font-weight:600;">${email}</strong>.
      Nhấn nút bên dưới để tiếp tục — liên kết hết hạn sau <strong style="color:#09090b;">15 phút</strong>.
    </p>

    <!-- CTA — centered, màu brand đỏ, border-radius 6px theo rules -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-radius:6px;background-color:#dc2626;">
                <a href="${resetUrl}"
                   target="_blank"
                   style="display:inline-block;padding:14px 32px;font-family:${F};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.2px;">
                  Đặt lại mật khẩu
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Fallback link — monospace, nền nhạt -->
    <p style="margin:0 0 6px;font-family:${F};font-size:12px;color:#a1a1aa;">Không nhấn được nút? Dán liên kết sau vào trình duyệt:</p>
    <p style="margin:0 0 24px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#52525b;word-break:break-all;background:#fafafa;border:1px solid #e4e4e7;border-radius:4px;padding:10px 12px;">
      <a href="${resetUrl}" style="color:#52525b;text-decoration:none;">${resetUrl}</a>
    </p>

    <hr style="border:none;border-top:1px solid #f4f4f5;margin:0 0 20px;" />

    <!-- Security note — text thuần, không box màu vàng, không emoji -->
    <p style="margin:0;font-family:${F};font-size:12px;color:#a1a1aa;line-height:1.6;">
      Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
      Mật khẩu hiện tại sẽ không thay đổi.
    </p>
  `;

  const html = emailShell({ shopName, supportEmail, bodyHtml });
  const text = `Đặt lại mật khẩu ${shopName}\n\nTài khoản: ${email}\nLinh kết đặt lại (hết hạn sau 15 phút):\n${resetUrl}\n\nNếu bạn không yêu cầu điều này, hãy bỏ qua email này.\n\n${shopName}`;

  return sendEmail({ to: email, subject, html, text });
};

// ─────────────────────────────────────────────────────────────────────────────
// Verify Email
// ─────────────────────────────────────────────────────────────────────────────
const sendVerificationEmail = async (email, verifyToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${clientUrl}/verify-email?token=${verifyToken}`;
  const shopName = process.env.SHOP_NAME || 'SHOP';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || 'support@shop.com';

  const subject = `Xác minh tài khoản ${shopName} của bạn`;

  const bodyHtml = `
    <p style="margin:0 0 4px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;line-height:1.25;letter-spacing:-0.4px;">Xác minh email</p>
    <p style="margin:0 0 24px;font-family:${F};font-size:13px;color:#71717a;">Gửi lúc ${new Date().toLocaleString('vi-VN')}</p>

    <hr style="border:none;border-top:1px solid #f4f4f5;margin:0 0 24px;" />

    <p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
      Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color:#09090b;">${shopName}</strong>.
      Nhấn nút bên dưới để xác minh địa chỉ <strong style="color:#09090b;">${email}</strong>
      và kích hoạt tài khoản. Liên kết có hiệu lực trong <strong style="color:#09090b;">24 giờ</strong>.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-radius:6px;background-color:#dc2626;">
                <a href="${verifyUrl}"
                   target="_blank"
                   style="display:inline-block;padding:14px 32px;font-family:${F};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.2px;">
                  Xác minh tài khoản
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 6px;font-family:${F};font-size:12px;color:#a1a1aa;">Không nhấn được nút? Dán liên kết sau vào trình duyệt:</p>
    <p style="margin:0 0 24px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#52525b;word-break:break-all;background:#fafafa;border:1px solid #e4e4e7;border-radius:4px;padding:10px 12px;">
      <a href="${verifyUrl}" style="color:#52525b;text-decoration:none;">${verifyUrl}</a>
    </p>

    <hr style="border:none;border-top:1px solid #f4f4f5;margin:0 0 20px;" />

    <p style="margin:0;font-family:${F};font-size:12px;color:#a1a1aa;line-height:1.6;">
      Nếu bạn không đăng ký tài khoản tại ${shopName}, hãy bỏ qua email này.
    </p>
  `;

  const html = emailShell({ shopName, supportEmail, bodyHtml });
  const text = `Xác minh tài khoản ${shopName}\n\nTài khoản: ${email}\nLiên kết xác minh:\n${verifyUrl}\n\nNếu bạn không đăng ký, hãy bỏ qua email này.`;

  return sendEmail({ to: email, subject, html, text });
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
