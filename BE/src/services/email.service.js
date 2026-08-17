const nodemailer = require('nodemailer');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'ĐÃ CÓ' : 'THIẾU');

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
      secure: process.env.EMAIL_SECURE === 'true', // true cho 465, false cho các port khác
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
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"E-Commerce App" <noreply@example.com>';

  if (transporter) {
    return transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  }

  // Fallback cho môi trường Development khi chưa cấu hình SMTP
  console.log('\n================== [EMAIL SERVICE (DEV MODE)] ==================');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || html}`);
  console.log('=================================================================\n');

  return { message: 'Email logged to console (SMTP credentials not configured)' };
};

/**
 * Gửi email đặt lại mật khẩu
 */
const sendResetPasswordEmail = async (email, resetToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const subject = '[E-Commerce] Yêu cầu đặt lại mật khẩu';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #2563eb; text-align: center;">Đặt lại mật khẩu</h2>
      <p>Xin chào,</p>
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email <strong>${email}</strong>.</p>
      <p>Vui lòng click vào nút bên dưới để tiến hành đặt lại mật khẩu của bạn (liên kết có hiệu lực trong vòng <strong>15 phút</strong>):</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Đặt lại mật khẩu
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">Hoặc copy đường dẫn sau vào trình duyệt: <br/><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #64748b; font-size: 13px;">Mã token của bạn: <code>${resetToken}</code></p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
    </div>
  `;
  const text = `Đặt lại mật khẩu cho tài khoản ${email}:\nTruy cập liên kết: ${resetUrl}\nHoặc sử dụng token: ${resetToken}\n(Liên kết có hiệu lực trong 15 phút).`;

  return sendEmail({ to: email, subject, html, text });
};

/**
 * Gửi email xác minh tài khoản
 */
const sendVerificationEmail = async (email, verifyToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${clientUrl}/verify-email?token=${verifyToken}`;

  const subject = '[E-Commerce] Xác minh tài khoản email của bạn';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #16a34a; text-align: center;">Xác minh địa chỉ Email</h2>
      <p>Xin chào,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào nút bên dưới để hoàn tất xác minh email của bạn:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #16a34a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Xác minh Email
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">Hoặc copy đường dẫn sau vào trình duyệt: <br/><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p style="color: #64748b; font-size: 13px;">Mã token xác minh: <code>${verifyToken}</code></p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">Liên kết này có hiệu lực trong vòng 24 giờ.</p>
    </div>
  `;
  const text = `Xác minh email cho tài khoản ${email}:\nTruy cập liên kết: ${verifyUrl}\nMã token xác minh: ${verifyToken}`;

  return sendEmail({ to: email, subject, html, text });
};

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
