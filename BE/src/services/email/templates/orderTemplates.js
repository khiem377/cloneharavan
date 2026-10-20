const {
  F,
  formatCurrency,
  renderCTAButton,
  renderTwoColSection,
  renderItemsListTable,
  renderFinancialSummary,
  renderEmailFooterNote,
  replacePlaceholders,
} = require('../layout');

const orderTemplates = [
  // 1. XÁC NHẬN ĐƠN HÀNG
  {
    id: 'order_confirmation',
    group: 'order',
    name: 'Xác nhận đơn hàng',
    description: 'Được gửi ngay khi bạn hoặc khách hàng đặt đơn hàng thành công trên website.',
    defaultSubject: 'Shop đã nhận đơn hàng #{{orderCode}} của bạn',
    defaults: {
      subject: 'Shop đã nhận đơn hàng #{{orderCode}} của bạn',
      greetingMessage: 'Xin chào {{customerName}}, Shop rất vui mừng thông báo đơn hàng #{{orderCode}} của bạn đã được tiếp nhận và đang được chuẩn bị để đóng gói.',
      specialNote: 'Quý khách vui lòng kiểm tra kỹ thông tin đơn hàng và đồng kiểm số lượng cùng shipper khi nhận hàng nhé!',
      ctaText: 'Xem chi tiết đơn hàng của bạn',
      footerNote: 'Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, đừng ngần ngại phản hồi trực tiếp email này để được hỗ trợ nhanh nhất.',
    },
    availableVariables: ['customerName', 'orderCode', 'shopName', 'orderDate', 'totalAmount'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const orderCode = order.orderCode || '6711';
      const orderDate = order.orderDate || new Date().toLocaleDateString('vi-VN');
      const customerName = data.customerName || order.customerName || order.shippingAddress?.fullName || 'Nguyễn Văn A';
      const customerEmail = order.customerEmail || order.shippingAddress?.email || 'nguyenvana@gmail.com';
      const customerPhone = order.customerPhone || order.shippingAddress?.phoneNumber || '0912 345 678';
      const shippingAddress = order.shippingAddress?.fullAddress || order.shippingAddress || '412 Đội Cấn, Phường Liễu Giai, Quận Ba Đình, Hà Nội';
      const paymentMethod = order.paymentMethod || (order.payment?.method === 'cod' ? 'Thanh toán khi giao hàng (COD)' : 'Ví điện tử MoMo (Đã thanh toán thành công)');
      const shippingMethod = order.shippingMethod || 'Giao hàng tiêu chuẩn (Giao Hàng Nhanh - GHN)';
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

      const items = order.items || [];
      const subtotal = order.pricing?.subtotal || items.reduce((s, it) => s + (it.subtotal || it.unitPrice * it.quantity), 0);
      const discount = order.pricing?.discount || order.pricing?.couponDiscount || 0;
      const shippingFee = order.pricing?.shippingFee || 0;
      const totalAmount = order.pricing?.totalAmount || (subtotal + shippingFee - discount);

      const vars = {
        customerName,
        orderCode,
        shopName,
        orderDate,
        totalAmount: formatCurrency(totalAmount),
      };

      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Shop đã nhận đơn hàng #${orderCode} của bạn`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>, Shop rất vui mừng thông báo đơn hàng <strong>#${orderCode}</strong> của bạn đã được tiếp nhận và đang được chuẩn bị để đóng gói.
          </p>`;

      const specialNoteHtml = custom.specialNote
        ? `<div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:6px;padding:12px 16px;margin:0 0 20px;font-size:13px;color:#92400e;line-height:1.6;">
            <strong>Lưu ý từ Shop:</strong> ${replacePlaceholders(custom.specialNote, vars)}
          </div>`
        : '';

      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Xem chi tiết đơn hàng của bạn';
      const footerNoteHtml = custom.footerNote
        ? `<div style="border-top:1px solid #f4f4f5;padding-top:16px;margin-top:20px;">
            <p style="margin:0;font-family:${F};font-size:12.5px;color:#71717a;line-height:1.6;">
              ${replacePlaceholders(custom.footerNote, vars)}
            </p>
          </div>`
        : renderEmailFooterNote(shopName);

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Cảm ơn bạn đã đặt hàng!</h2>
          ${greetingHtml}
          ${specialNoteHtml}

          ${renderCTAButton({ url: `${clientUrl}/tai-khoan`, text: ctaBtnText, primaryColor })}

          <div style="font-family:${F};font-size:14px;font-weight:700;color:#09090b;margin:0 0 10px;">
            Thông tin đơn hàng #${orderCode} <span style="font-weight:normal;font-size:12px;color:#71717a;">(${orderDate})</span>
          </div>

          ${renderTwoColSection({
            col1Title: 'Thông tin mua hàng',
            col1Content: `<strong>${customerName}</strong><br/>${customerEmail}<br/>${customerPhone}`,
            col2Title: 'Địa chỉ nhận hàng',
            col2Content: `<strong>${customerName}</strong><br/>${shippingAddress}<br/>Điện thoại: ${customerPhone}`,
          })}

          ${renderTwoColSection({
            col1Title: 'Phương thức thanh toán',
            col1Content: paymentMethod,
            col2Title: 'Phương thức vận chuyển',
            col2Content: shippingMethod,
          })}

          <div style="font-family:${F};font-size:14px;font-weight:700;color:#09090b;margin:20px 0 10px;">
            Chi tiết các sản phẩm đặt mua:
          </div>

          ${renderItemsListTable(items, primaryColor)}
          ${renderFinancialSummary({ subtotal, discount, shippingFee, totalAmount, primaryColor })}
          ${footerNoteHtml}
        `,
      };
    },
  },

  // 2. THANH TOÁN THÀNH CÔNG
  {
    id: 'payment_success',
    group: 'order',
    name: 'Xác nhận thanh toán thành công',
    description: 'Được gửi khi đơn hàng chuyển sang trạng thái đã thanh toán thành công.',
    defaultSubject: 'Thanh toán thành công cho đơn hàng #{{orderCode}}',
    defaults: {
      subject: 'Thanh toán thành công cho đơn hàng #{{orderCode}}',
      greetingMessage: 'Xin chào {{customerName}}, Shop xin xác nhận đã nhận được khoản thanh toán {{totalAmount}} cho đơn hàng #{{orderCode}}.',
      specialNote: 'Giao dịch thanh toán trực tuyến đã được xác thực an toàn trên hệ thống của Shop.',
      ctaText: 'Kiểm tra trạng thái đơn hàng',
      footerNote: 'Cảm ơn bạn đã tin tưởng thanh toán trực tuyến cùng Shop!',
    },
    availableVariables: ['customerName', 'orderCode', 'shopName', 'totalAmount', 'transactionId'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const orderCode = order.orderCode || '6711';
      const orderDate = order.orderDate || new Date().toLocaleDateString('vi-VN');
      const customerName = data.customerName || order.customerName || order.shippingAddress?.fullName || 'Nguyễn Văn A';
      const customerEmail = order.customerEmail || order.shippingAddress?.email || 'nguyenvana@gmail.com';
      const customerPhone = order.customerPhone || order.shippingAddress?.phoneNumber || '0912 345 678';
      const shippingAddress = order.shippingAddress?.fullAddress || order.shippingAddress || '412 Đội Cấn, Phường Liễu Giai, Quận Ba Đình, Hà Nội';
      const paymentMethod = order.paymentMethod || 'Ví điện tử MoMo (Đã thanh toán thành công)';
      const shippingMethod = order.shippingMethod || 'Giao hàng tiêu chuẩn (Giao Hàng Nhanh - GHN)';
      const items = order.items || [];
      const subtotal = order.pricing?.subtotal || items.reduce((s, it) => s + (it.subtotal || it.unitPrice * it.quantity), 0);
      const discount = order.pricing?.discount || order.pricing?.couponDiscount || 0;
      const shippingFee = order.pricing?.shippingFee || 0;
      const totalAmount = order.pricing?.totalAmount || (subtotal + shippingFee - discount);
      const paymentTime = new Date().toLocaleString('vi-VN');
      const transactionId = data.transactionId || 'MOMO-984729103';
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

      const vars = { customerName, orderCode, shopName, totalAmount: formatCurrency(totalAmount), transactionId };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Thanh toán thành công cho đơn hàng #${orderCode}`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 16px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 16px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>,<br/>
            Cảm ơn bạn đã đặt hàng tại <strong>${shopName}</strong>! Đơn hàng <strong>#${orderCode}</strong> của bạn đã được thanh toán thành công qua <strong>${paymentMethod}</strong>.
          </p>`;

      const specialNoteHtml = custom.specialNote
        ? `<div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:12px 16px;margin:0 0 20px;font-size:13px;color:#065f46;line-height:1.6;">
            ${replacePlaceholders(custom.specialNote, vars)}
          </div>`
        : '';

      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Kiểm tra trạng thái đơn hàng';
      const footerNoteHtml = custom.footerNote
        ? `<div style="border-top:1px solid #f4f4f5;padding-top:16px;margin-top:20px;">
            <p style="margin:0;font-family:${F};font-size:12.5px;color:#71717a;line-height:1.6;">
              ${replacePlaceholders(custom.footerNote, vars)}
            </p>
          </div>`
        : renderEmailFooterNote(shopName);

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#059669;">Xác nhận thanh toán đơn hàng thành công</h2>
          ${greetingHtml}
          ${specialNoteHtml}

          <div style="border-top:1px solid #e4e4e7;margin:16px 0;"></div>

          ${renderTwoColSection({
            col1Title: 'Thông tin mua hàng',
            col1Content: `<strong>${customerName}</strong><br/>${customerEmail}<br/>${customerPhone}`,
            col2Title: 'Địa chỉ nhận hàng',
            col2Content: `<strong>${customerName}</strong><br/>${shippingAddress}<br/>Điện thoại: ${customerPhone}`,
          })}

          ${renderTwoColSection({
            col1Title: 'Phương thức thanh toán',
            col1Content: paymentMethod,
            col2Title: 'Phương thức vận chuyển',
            col2Content: shippingMethod,
          })}

          <div style="font-family:${F};font-size:14px;font-weight:700;color:#09090b;margin:16px 0 10px;">
            Thông tin đơn hàng #${orderCode} <span style="font-weight:normal;font-size:12px;color:#71717a;">(Ngày đặt: ${orderDate})</span>
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid #a7f3d0;border-radius:6px;background:#ecfdf5;">
            <tr>
              <td style="padding:12px 16px;">
                <div style="font-family:${F};font-size:12.5px;font-weight:700;color:#065f46;margin-bottom:4px;">GIAO DỊCH TRỰC TUYẾN ĐÃ HOÀN TẤT:</div>
                <div style="font-family:${F};font-size:12px;color:#047857;line-height:1.6;">
                  • Mã giao dịch: <strong>${transactionId}</strong> &bull; Thời gian: <strong>${paymentTime}</strong><br/>
                  • Số tiền đã thanh toán: <strong>${formatCurrency(totalAmount)}</strong>
                </div>
              </td>
            </tr>
          </table>

          <div style="font-family:${F};font-size:14px;font-weight:700;color:#09090b;margin:20px 0 10px;">
            Chi tiết các sản phẩm đặt mua:
          </div>
          ${renderItemsListTable(items, primaryColor)}
          ${renderFinancialSummary({ subtotal, discount, shippingFee, totalAmount, primaryColor })}

          ${renderCTAButton({ url: `${clientUrl}/tai-khoan`, text: ctaBtnText, primaryColor })}
          ${footerNoteHtml}
        `,
      };
    },
  },

  // 3. GIỎ HÀNG BỎ QUÊN
  {
    id: 'abandoned_checkout',
    group: 'order',
    name: 'Hoàn tất đơn hàng (Giỏ hàng bỏ quên)',
    description: 'Gửi đến khách hàng đã chọn sản phẩm nhưng chưa hoàn thành việc đặt hàng.',
    defaultSubject: 'Bạn có đơn hàng chưa hoàn tất tại {{shopName}}',
    defaults: {
      subject: 'Bạn có đơn hàng chưa hoàn tất tại {{shopName}}',
      greetingMessage: 'Xin chào {{customerName}}, Shop nhận thấy bạn đã chọn một số sản phẩm ưng ý vào giỏ hàng nhưng chưa kịp hoàn tất thanh toán. Sản phẩm của bạn vẫn đang được giữ trong giỏ hàng.',
      specialNote: 'Số lượng sản phẩm trong kho có hạn, bạn nhanh tay hoàn tất để không bỏ lỡ chương trình ưu đãi nhé!',
      ctaText: 'Hoàn tất đơn hàng của bạn ngay',
      footerNote: 'Shop luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.',
    },
    availableVariables: ['customerName', 'shopName'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const customerName = data.customerName || order.customerName || 'Nguyễn Văn A';
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const checkoutUrl = data.checkoutUrl || `${clientUrl}/checkout`;
      const items = order.items || [];

      const vars = { customerName, shopName };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Bạn có đơn hàng chưa hoàn tất tại ${shopName}`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>, Shop nhận thấy bạn đã chọn một số sản phẩm ưng ý vào giỏ hàng nhưng chưa kịp hoàn tất thanh toán. Sản phẩm của bạn vẫn đang được giữ trong giỏ hàng.
          </p>`;

      const specialNoteHtml = custom.specialNote
        ? `<div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:6px;padding:12px 16px;margin:0 0 20px;font-size:13px;color:#92400e;line-height:1.6;">
            ${replacePlaceholders(custom.specialNote, vars)}
          </div>`
        : '';

      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Hoàn tất đơn hàng của bạn ngay';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Đơn hàng của bạn vẫn đang chờ!</h2>
          ${greetingHtml}
          ${specialNoteHtml}

          <div style="font-family:${F};font-size:13.5px;font-weight:700;color:#09090b;margin:0 0 10px;">
            Các sản phẩm bạn đã chọn:
          </div>
          ${renderItemsListTable(items, primaryColor)}

          ${renderCTAButton({ url: checkoutUrl, text: ctaBtnText, primaryColor })}

          <p style="margin:0;font-family:${F};font-size:12.5px;color:#71717a;text-align:center;">
            Hoặc truy cập trực tiếp website tại: <a href="${clientUrl}" style="color:${primaryColor};font-weight:600;">${clientUrl}</a>
          </p>
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },

  // 4. HỦY ĐƠN HÀNG
  {
    id: 'order_cancelled',
    group: 'order',
    name: 'Thông báo hủy đơn hàng',
    description: 'Được gửi khi đơn hàng bị hủy bỏ.',
    defaultSubject: 'Đơn hàng #{{orderCode}} đã được hủy',
    defaults: {
      subject: 'Đơn hàng #{{orderCode}} đã được hủy',
      greetingMessage: 'Xin chào {{customerName}}, Shop xin thông báo đơn hàng #{{orderCode}} của bạn đã được hủy thành công trên hệ thống.',
      specialNote: 'Nếu đơn hàng này đã được bạn thanh toán trước, số tiền sẽ được Shop hoàn trả lại theo đúng chính sách hoàn tiền trong vòng 1 - 3 ngày làm việc.',
      ctaText: 'Khám phá sản phẩm khác tại Shop',
      footerNote: 'Rất tiếc vì sự bất tiện này, hy vọng được phục vụ bạn trong các đơn hàng tới.',
    },
    availableVariables: ['customerName', 'orderCode', 'shopName', 'reason'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const orderCode = order.orderCode || '6711';
      const customerName = data.customerName || order.customerName || order.shippingAddress?.fullName || 'Nguyễn Văn A';
      const reason = data.reason || order.cancelReason || 'Theo yêu cầu của khách hàng';
      const cancelDate = new Date().toLocaleString('vi-VN');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

      const vars = { customerName, orderCode, shopName, reason };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Đơn hàng #${orderCode} đã được hủy`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>, Shop xin thông báo đơn hàng <strong>#${orderCode}</strong> đã được hủy thành công trên hệ thống vào lúc ${cancelDate}.
          </p>`;

      const specialNoteHtml = custom.specialNote
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:13px;color:#52525b;line-height:1.65;">${replacePlaceholders(custom.specialNote, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:13px;color:#52525b;line-height:1.65;">
            Nếu đơn hàng này đã được bạn thanh toán trước, số tiền sẽ được Shop hoàn trả lại theo đúng chính sách hoàn tiền trong vòng 1 - 3 ngày làm việc.
          </p>`;

      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Khám phá sản phẩm khác tại Shop';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#dc2626;">Đơn hàng đã được hủy</h2>
          ${greetingHtml}

          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px 16px;margin:0 0 20px;">
            <div style="font-family:${F};font-size:11px;color:#991b1b;font-weight:700;text-transform:uppercase;">LÝ DO HỦY ĐƠN HÀNG:</div>
            <div style="font-family:${F};font-size:13.5px;color:#7f1d1d;margin-top:4px;">${reason}</div>
          </div>

          ${specialNoteHtml}

          ${renderCTAButton({ url: clientUrl, text: ctaBtnText, primaryColor })}
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },

  // 5. HOÀN TRẢ / HOÀN TIỀN
  {
    id: 'order_refunded',
    group: 'order',
    name: 'Xác nhận hoàn trả',
    description: 'Được gửi sau khi shop thực hiện hoàn tiền hoặc hoàn hàng cho bạn.',
    defaultSubject: 'Xác nhận hoàn tiền cho đơn hàng #{{orderCode}}',
    defaults: {
      subject: 'Xác nhận hoàn tiền cho đơn hàng #{{orderCode}}',
      greetingMessage: 'Xin chào {{customerName}}, Shop đã xử lý hoàn số tiền {{refundAmount}} cho đơn hàng #{{orderCode}} của bạn.',
      specialNote: 'Thời gian dự kiến tiền về tài khoản: 1 - 3 ngày làm việc (tùy thuộc vào ngân hàng thụ hưởng của bạn).',
      ctaText: 'Xem chi tiết đơn hàng',
      footerNote: 'Trân trọng cảm ơn sự phối hợp của bạn.',
    },
    availableVariables: ['customerName', 'orderCode', 'shopName', 'refundAmount'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const orderCode = order.orderCode || '6711';
      const customerName = data.customerName || order.customerName || order.shippingAddress?.fullName || 'Nguyễn Văn A';
      const refundAmount = data.refundAmount || order.pricing?.totalAmount || 1220000;
      const refundDate = new Date().toLocaleString('vi-VN');

      const vars = { customerName, orderCode, shopName, refundAmount: formatCurrency(refundAmount) };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Xác nhận hoàn tiền cho đơn hàng #${orderCode}`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>, Shop đã xử lý hoàn số tiền <strong>${formatCurrency(refundAmount)}</strong> cho đơn hàng <strong>#${orderCode}</strong> của bạn vào lúc ${refundDate}.
          </p>`;

      const specialNote = custom.specialNote ? replacePlaceholders(custom.specialNote, vars) : '1 - 3 ngày làm việc (tùy thuộc vào ngân hàng thụ hưởng của bạn).';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Xác nhận hoàn tiền</h2>
          ${greetingHtml}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid #e4e4e7;border-radius:6px;background:#fafafa;">
            <tr>
              <td style="padding:14px 18px;">
                <div style="font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;margin-bottom:6px;">CHI TIẾT HOÀN TIỀN:</div>
                <div style="font-family:${F};font-size:13px;color:#27272a;line-height:1.65;">
                  • Mã đơn hàng: <strong>#${orderCode}</strong><br/>
                  • Số tiền hoàn lại: <strong style="color:${primaryColor};font-size:15px;">${formatCurrency(refundAmount)}</strong><br/>
                  • Thời gian dự kiến: <strong>${specialNote}</strong>
                </div>
              </td>
            </tr>
          </table>
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },

  // 6. CẬP NHẬT ĐƠN HÀNG
  {
    id: 'order_edited',
    group: 'order',
    name: 'Cập nhật đơn hàng',
    description: 'Được gửi khi quản trị viên thay đổi thông tin sản phẩm hoặc địa chỉ trong đơn.',
    defaultSubject: 'Đơn hàng #{{orderCode}} của bạn đã được cập nhật',
    defaults: {
      subject: 'Đơn hàng #{{orderCode}} của bạn đã được cập nhật',
      greetingMessage: 'Xin chào {{customerName}}, Shop xin thông báo thông tin đơn hàng #{{orderCode}} của bạn vừa được cập nhật.',
      specialNote: 'Các thay đổi có thể bao gồm số lượng sản phẩm, địa chỉ giao nhận hoặc phí vận chuyển.',
      ctaText: 'Xem đơn hàng đã cập nhật',
      footerNote: 'Nếu có bất kỳ thắc mắc nào, đừng ngần ngại phản hồi email này nhé.',
    },
    availableVariables: ['customerName', 'orderCode', 'shopName'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const order = data.order || {};
      const orderCode = order.orderCode || '6711';
      const customerName = data.customerName || order.customerName || order.shippingAddress?.fullName || 'Nguyễn Văn A';
      const updateDate = new Date().toLocaleString('vi-VN');
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

      const vars = { customerName, orderCode, shopName };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `Đơn hàng #${orderCode} của bạn đã được cập nhật`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Xin chào <strong>${customerName}</strong>, Shop xin thông báo thông tin đơn hàng <strong>#${orderCode}</strong> của bạn vừa được cập nhật vào lúc ${updateDate}.
          </p>`;

      const specialNoteHtml = custom.specialNote
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:13px;color:#52525b;line-height:1.65;">${replacePlaceholders(custom.specialNote, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:13px;color:#52525b;line-height:1.65;">
            Các thay đổi có thể bao gồm số lượng sản phẩm, địa chỉ giao nhận hoặc thông tin vận chuyển. Bạn có thể nhấn vào liên kết bên dưới để xem chi tiết mới nhất của đơn hàng.
          </p>`;

      const ctaBtnText = custom.ctaText ? replacePlaceholders(custom.ctaText, vars) : 'Xem đơn hàng đã cập nhật';

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Thông tin đơn hàng đã được cập nhật</h2>
          ${greetingHtml}
          ${specialNoteHtml}

          ${renderCTAButton({ url: `${clientUrl}/tai-khoan`, text: ctaBtnText, primaryColor })}
          ${renderEmailFooterNote(shopName)}
        `,
      };
    },
  },
];

module.exports = orderTemplates;
