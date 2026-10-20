const {
  F,
  renderCTAButton,
  renderItemsListTable,
  renderEmailFooterNote,
  replacePlaceholders,
} = require('../layout');

const shippingTemplates = [
  // 1. XÁC NHẬN GIAO VẬN
  {
    id: 'shipping_confirmation',
    group: 'shipping',
    name: 'Xác nhận giao vận',
    description: 'Được gửi khi đơn hàng được đóng gói và bàn giao cho đơn vị vận chuyển.',
    defaultSubject: 'Đơn hàng #{{orderCode}} của bạn đang trên đường giao',
    defaults: {
      subject: 'Đơn hàng #{{orderCode}} của bạn đang trên đường giao',
      greetingMessage: 'Xin chào {{customerName}}, kiện hàng cho đơn #{{orderCode}} của bạn tại Shop đã được đóng gói kỹ lưỡng và bàn giao cho đối tác vận chuyển {{carrierName}}.',
      specialNote: 'Thời gian giao hàng dự kiến từ 1 - 3 ngày làm việc. Shipper sẽ gọi điện trước khi phát hàng.',
      ctaText: 'Theo dõi hành trình vận đơn',
      footerNote: 'Trân trọng cảm ơn bạn đã tin tưởng và đồng hành cùng Shop!',
    },
    availableVariables: ['customerName', 'orderCode', 'shopName', 'trackingCode', 'carrierName'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const orderCode = order.orderCode || '6711';
      const customerName = data.customerName || order.customerName || order.shippingAddress?.fullName || 'Nguyễn Văn A';
      const trackingCode = data.trackingCode || 'GHN-894729103';
      const carrierName = data.carrierName || 'Giao Hàng Nhanh (GHN)';
      const trackingUrl = data.trackingUrl || 'https://ghn.vn/blogs/trang-thai-don-hang';
      const receiverAddress = order.shippingAddress?.fullAddress || order.shippingAddress || '412 Đội Cấn, Phường Liễu Giai, Quận Ba Đình, Hà Nội';
      const items = order.items || [];

      const vars = { customerName, orderCode, shopName, trackingCode, carrierName };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Đơn hàng #${orderCode} của bạn đang trên đường giao`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>, kiện hàng cho đơn <strong>#${orderCode}</strong> của bạn tại Shop đã được đóng gói kỹ lưỡng và bàn giao cho đối tác vận chuyển <strong>${carrierName}</strong>.
          </p>`;

      const specialNote = custom.specialNote ? replacePlaceholders(custom.specialNote, vars) : 'Thời gian giao dự kiến: 1 - 3 ngày';
      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Theo dõi hành trình vận đơn';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Đơn hàng của bạn đang được giao!</h2>
          ${greetingHtml}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid #bae6fd;border-radius:6px;background:#f0f9ff;">
            <tr>
              <td style="padding:16px 18px;">
                <div style="font-family:${F};font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">MÃ VẬN ĐƠN TRA CỨU:</div>
                <div style="font-family:${F};font-size:18px;font-weight:800;color:#0c4a6e;letter-spacing:0.5px;">${trackingCode}</div>
                <div style="font-family:${F};font-size:12px;color:#0284c7;margin-top:4px;">Đơn vị vận chuyển: <strong>${carrierName}</strong> (${specialNote})</div>
              </td>
            </tr>
          </table>

          ${renderCTAButton({ url: trackingUrl, text: ctaBtnText, primaryColor })}

          <div style="font-family:${F};font-size:14px;font-weight:700;color:#09090b;margin:20px 0 10px;">
            Thông tin người nhận hàng:
          </div>
          <p style="margin:0 0 20px;font-family:${F};font-size:13px;color:#3f3f46;line-height:1.6;background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;padding:12px 16px;">
            Người nhận: <strong>${customerName}</strong><br/>
            Địa chỉ nhận: ${receiverAddress}
          </p>

          <div style="font-family:${F};font-size:14px;font-weight:700;color:#09090b;margin:0 0 10px;">
            Sản phẩm trong kiện hàng này:
          </div>
          ${renderItemsListTable(items, primaryColor)}
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },

  // 2. GIAO HÀNG THÀNH CÔNG
  {
    id: 'shipping_delivered',
    group: 'shipping',
    name: 'Giao hàng thành công',
    description: 'Được gửi tự động khi đơn hàng đã được giao thành công tới tay bạn.',
    defaultSubject: 'Đơn hàng #{{orderCode}} đã được giao thành công',
    defaults: {
      subject: 'Đơn hàng #{{orderCode}} đã được giao thành công',
      greetingMessage: 'Xin chào {{customerName}}, kiện hàng cho đơn #{{orderCode}} đã được đối tác vận chuyển phát thành công tới bạn.',
      specialNote: 'Shop hy vọng bạn hài lòng với những sản phẩm đã chọn! Nếu bạn có bất kỳ phản hồi hoặc cần hỗ trợ bảo hành đổi trả, Shop luôn sẵn sàng phục vụ bạn.',
      ctaText: 'Đánh giá sản phẩm / Xem đơn hàng',
      footerNote: 'Cảm ơn bạn đã mua sắm tại Shop!',
    },
    availableVariables: ['customerName', 'orderCode', 'shopName'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const orderCode = order.orderCode || '6711';
      const customerName = data.customerName || order.customerName || order.shippingAddress?.fullName || 'Nguyễn Văn A';
      const deliveredTime = new Date().toLocaleString('vi-VN');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

      const vars = { customerName, orderCode, shopName };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Đơn hàng #${orderCode} đã được giao thành công`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>, kiện hàng cho đơn <strong>#${orderCode}</strong> đã được đối tác vận chuyển phát thành công tới bạn vào lúc ${deliveredTime}.
          </p>`;

      const specialNote = custom.specialNote
        ? replacePlaceholders(custom.specialNote, vars)
        : 'Shop hy vọng bạn hài lòng với những sản phẩm đã chọn! Nếu bạn có bất kỳ phản hồi hoặc cần hỗ trợ bảo hành đổi trả, Shop luôn sẵn sàng phục vụ bạn bất cứ lúc nào.';
      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Đánh giá sản phẩm / Xem đơn hàng';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#059669;">Giao hàng thành công!</h2>
          ${greetingHtml}

          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:16px;margin:0 0 20px;">
            <p style="margin:0;font-family:${F};font-size:13px;color:#065f46;line-height:1.6;">
              ${specialNote}
            </p>
          </div>

          ${renderCTAButton({ url: `${clientUrl}/tai-khoan`, text: ctaBtnText, primaryColor })}
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },
];

module.exports = shippingTemplates;
