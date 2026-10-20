const {
  F,
  renderCTAButton,
  renderEmailFooterNote,
  replacePlaceholders,
} = require('../layout');

const accountTemplates = [
  // 1. ĐẶT LẠI MẬT KHẨU
  {
    id: 'reset_password',
    group: 'account',
    name: 'Đặt lại mật khẩu',
    description: 'Được gửi khi khách hàng yêu cầu khôi phục hoặc đổi mật khẩu tài khoản.',
    defaultSubject: 'Đặt lại mật khẩu tài khoản {{shopName}}',
    defaults: {
      subject: 'Đặt lại mật khẩu tài khoản {{shopName}}',
      greetingMessage: 'Shop đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản {{email}} của bạn. Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới.',
      specialNote: 'Liên kết này có hiệu lực trong vòng 15 phút. Tuyệt đối không chia sẻ liên kết này cho người khác.',
      ctaText: 'Đặt lại mật khẩu của bạn',
      footerNote: 'Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn được bảo vệ hoàn toàn an toàn.',
    },
    availableVariables: ['email', 'shopName'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const email = data.email || 'customer@example.com';
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const resetUrl = data.resetUrl || `${clientUrl}/reset-password?token=sample_token_xyz`;

      const vars = { email, shopName };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Đặt lại mật khẩu tài khoản ${shopName}`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Shop đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong> của bạn.
            Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới. Liên kết này có hiệu lực trong vòng <strong style="color:#09090b;">15 phút</strong>.
          </p>`;

      const specialNote = custom.specialNote
        ? `<p style="margin:0 0 16px;font-family:${F};font-size:12.5px;color:#b45309;line-height:1.6;">${replacePlaceholders(custom.specialNote, vars)}</p>`
        : '';
      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Đặt lại mật khẩu của bạn';
      const footerNoteHtml = custom.footerNote
        ? `<p style="margin:0;font-family:${F};font-size:12px;color:#a1a1aa;line-height:1.6;">${replacePlaceholders(custom.footerNote, vars)}</p>`
        : `<p style="margin:0;font-family:${F};font-size:12px;color:#a1a1aa;line-height:1.6;">
            Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email. Mật khẩu hiện tại của bạn vẫn được bảo vệ hoàn toàn an toàn.
          </p>`;

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Yêu cầu đặt lại mật khẩu</h2>
          ${greetingHtml}
          ${specialNote}

          ${renderCTAButton({ url: resetUrl, text: ctaBtnText, primaryColor })}

          <p style="margin:0 0 6px;font-family:${F};font-size:12px;color:#71717a;">Không nhấn được nút? Bạn có thể dán đường dẫn sau vào trình duyệt:</p>
          <p style="margin:0 0 20px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#52525b;word-break:break-all;background:#fafafa;border:1px solid #e4e4e7;border-radius:4px;padding:10px 12px;">
            <a href="${resetUrl}" style="color:#52525b;text-decoration:none;">${resetUrl}</a>
          </p>

          ${footerNoteHtml}
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },

  // 2. XÁC MINH TÀI KHOẢN EMAIL
  {
    id: 'verify_email',
    group: 'account',
    name: 'Xác minh tài khoản email',
    description: 'Được gửi ngay khi khách hàng đăng ký tài khoản mới để kích hoạt email.',
    defaultSubject: 'Xác minh tài khoản {{shopName}} của bạn',
    defaults: {
      subject: 'Xác minh tài khoản {{shopName}} của bạn',
      greetingMessage: 'Chào mừng bạn đến với {{shopName}}! Cảm ơn bạn đã đăng ký tài khoản thành viên. Vui lòng nhấn nút bên dưới để xác minh địa chỉ {{email}} và kích hoạt đầy đủ quyền lợi.',
      specialNote: 'Liên kết xác minh có hiệu lực trong vòng 24 giờ kể từ thời điểm gửi thư.',
      ctaText: 'Kích hoạt tài khoản của bạn',
      footerNote: 'Nếu bạn không đăng ký tài khoản tại Shop, vui lòng bỏ qua email này.',
    },
    availableVariables: ['email', 'shopName'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const email = data.email || 'customer@example.com';
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const verifyUrl = data.verifyUrl || `${clientUrl}/verify-email?token=sample_token_xyz`;

      const vars = { email, shopName };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Xác minh tài khoản ${shopName} của bạn`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Cảm ơn bạn đã đăng ký tài khoản thành viên tại <strong>${shopName}</strong>.
            Vui lòng nhấn nút bên dưới để xác minh địa chỉ <strong>${email}</strong> và kích hoạt đầy đủ quyền lợi thành viên của bạn.
            Liên kết có hiệu lực trong vòng <strong style="color:#09090b;">24 giờ</strong>.
          </p>`;

      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Kích hoạt tài khoản của bạn';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Chào mừng bạn đến với ${shopName}!</h2>
          ${greetingHtml}

          ${renderCTAButton({ url: verifyUrl, text: ctaBtnText, primaryColor })}

          <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;padding:14px 16px;margin:0 0 20px;">
            <div style="font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;margin-bottom:6px;">QUYỀN LỢI THÀNH VIÊN:</div>
            <div style="font-family:${F};font-size:12.5px;color:#3f3f46;line-height:1.6;">
              • Tích lũy điểm thưởng trên từng đơn hàng đã giao.<br/>
              • Tra cứu nhanh lộ trình vận đơn và lịch sử mua sắm.<br/>
              • Nhận thông báo sớm các chương trình Flash Sale & Coupon độc quyền.
            </div>
          </div>

          <p style="margin:0 0 6px;font-family:${F};font-size:12px;color:#71717a;">Không nhấn được nút? Dán đường dẫn sau vào trình duyệt:</p>
          <p style="margin:0 0 20px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#52525b;word-break:break-all;background:#fafafa;border:1px solid #e4e4e7;border-radius:4px;padding:10px 12px;">
            <a href="${verifyUrl}" style="color:#52525b;text-decoration:none;">${verifyUrl}</a>
          </p>

          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },

  // 3. MÃ OTP ĐĂNG NHẬP ADMIN (2FA)
  {
    id: 'admin_login_otp',
    group: 'admin',
    name: 'Mã OTP bảo mật Quản trị viên (2FA)',
    description: 'Được gửi đến email quản trị viên khi kích hoạt đăng nhập hai bước bằng OTP.',
    defaultSubject: '[{{shopName}}] Mã OTP đăng nhập Quản trị viên: {{otp}}',
    defaults: {
      subject: '[{{shopName}}] Mã xác thực đăng nhập Quản trị viên: {{otp}}',
      greetingMessage: 'Hệ thống quản trị {{shopName}} vừa nhận được yêu cầu đăng nhập bằng email {{email}}. Nhập mã xác thực gồm 6 chữ số dưới đây để hoàn tất đăng nhập:',
      specialNote: 'Mã xác thực có hiệu lực trong vòng 5 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.',
      ctaText: 'Đăng nhập hệ thống',
      footerNote: 'Nếu bạn không thực hiện yêu cầu này, vui lòng đổi mật khẩu tài khoản quản trị ngay lập tức.',
    },
    availableVariables: ['otp', 'email', 'shopName'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const email = data.email || 'admin@dakshop.vn';
      const otp = data.otp || '892104';
      const requestTime = new Date().toLocaleString('vi-VN');

      const vars = { otp, email, shopName };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `[${shopName}] Mã xác thực đăng nhập Quản trị viên: ${otp}`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Hệ thống quản trị <strong>${shopName}</strong> vừa nhận được yêu cầu đăng nhập bằng email <strong>${email}</strong> vào lúc ${requestTime}.
            Nhập mã xác thực gồm 6 chữ số dưới đây để hoàn tất đăng nhập:
          </p>`;

      const specialNote = custom.specialNote ? replacePlaceholders(custom.specialNote, vars) : 'Mã xác thực có hiệu lực trong vòng 5 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Mã xác thực đăng nhập Admin</h2>
          ${greetingHtml}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
            <tr>
              <td align="center">
                <div style="display:inline-block;padding:16px 36px;background:#f8fafc;border:1.5px dashed #cbd5e1;border-radius:6px;">
                  <span style="font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:800;letter-spacing:8px;color:${primaryColor};">${otp}</span>
                </div>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 16px;font-family:${F};font-size:13px;color:#64748b;text-align:center;">
            ${specialNote}
          </p>

          <p style="margin:0;font-family:${F};font-size:12px;color:#a1a1aa;line-height:1.6;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng đổi mật khẩu tài khoản quản trị ngay lập tức và kiểm tra nhật ký truy cập hệ thống.
          </p>
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },
];

module.exports = accountTemplates;
