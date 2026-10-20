const {
  F,
  formatCurrency,
  replacePlaceholders,
  renderEmailFooterNote,
} = require('../layout');

const procurementTemplates = [
  // ĐƠN ĐẶT MUA HÀNG NHÀ CUNG CẤP (PO)
  {
    id: 'purchase_order',
    group: 'admin',
    name: 'Đơn đặt hàng Nhà Cung Cấp (PO)',
    description: 'Được gửi trực tiếp tới nhà cung cấp khi bộ phận mua hàng tạo phiếu PO.',
    defaultSubject: '[{{shopName}}] - Đơn Đặt Mua Hàng Mới #{{poNumber}}',
    defaults: {
      subject: '[{{shopName}}] - Đơn Đặt Mua Hàng Mới #{{poNumber}}',
      greetingMessage: 'Kính gửi {{supplierName}}, Bộ phận Mua Hàng & Quản Lý Kho {{shopName}} xin trân trọng gửi tới Quý Nhà Cung Cấp đơn đặt mua hàng chính thức số #{{poNumber}}.',
      specialNote: 'Quy định giao nhận: Hàng hóa phải còn nguyên seal tem nhãn, hạn sử dụng tối thiểu 70%. Chứng từ giao hàng đi kèm gồm 02 liên Phiếu Giao Hàng và Hóa đơn GTGT.',
      ctaText: 'Xác nhận đơn đặt hàng',
      footerNote: 'Trân trọng cảm ơn sự hợp tác của Quý Nhà Cung Cấp đối tác!',
    },
    availableVariables: ['poNumber', 'supplierName', 'shopName', 'orderDate', 'totalAmount'],
    render: ({ shopName, primaryColor, data, custom = {} }) => {
      const po = data.po || {};
      const poNumber = po.poNumber || 'PO-20261020-001';
      const orderDate = new Date().toLocaleDateString('vi-VN');
      const supplierName = data.supplier?.name || po.supplierId?.name || 'Quý Nhà Cung Cấp';
      const items = po.items || [
        { productName: 'Hộp Bánh Quy Bơ Pháp 400g', sku: 'SKU-BQ-01', unit: 'Hộp', quantity: 50, importPrice: 85000, subtotal: 4250000 },
        { productName: 'Kẹo Dẻo Trái Cây Hộp 250g', sku: 'SKU-KD-02', unit: 'Hộp', quantity: 100, importPrice: 32000, subtotal: 3200000 },
      ];
      const totalAmount = po.totalAmount || 7450000;

      const vars = { poNumber, supplierName, shopName, orderDate, totalAmount: formatCurrency(totalAmount) };
      const finalSubject = custom.subject ? replacePlaceholders(custom.subject, vars) : `[${shopName}] - Đơn Đặt Mua Hàng Mới #${poNumber}`;
      const greetingHtml = custom.greetingMessage
        ? `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">${replacePlaceholders(custom.greetingMessage, vars)}</p>`
        : `<p style="margin:0 0 20px;font-family:${F};font-size:14px;color:#3f3f46;line-height:1.65;">
            Kính gửi <strong>${supplierName}</strong>,<br/>
            Bộ phận Mua Hàng & Quản Lý Kho <strong>${shopName}</strong> xin trân trọng gửi tới Quý Nhà Cung Cấp đơn đặt mua hàng chính thức số <strong>#${poNumber}</strong> ngày ${orderDate}. Kính đề nghị Quý đối tác xác nhận và sắp xếp giao hàng theo đúng số lượng và đơn giá thỏa thuận.
          </p>`;

      const specialNote = custom.specialNote
        ? replacePlaceholders(custom.specialNote, vars)
        : 'Quy định giao nhận: Hàng hóa phải còn nguyên seal tem nhãn, hạn sử dụng tối thiểu 70%. Chứng từ giao hàng đi kèm gồm 02 liên Phiếu Giao Hàng và Hóa đơn GTGT.';

      const footerNote = custom.footerNote
        ? replacePlaceholders(custom.footerNote, vars)
        : `Trân trọng cảm ơn sự hợp tác của Quý Nhà Cung Cấp đối tác!<br/><strong>Phòng Cung Ứng & Quản Lý Kho Hàng — ${shopName}</strong>`;

      const itemsHtml = items
        .map(
          (it, idx) => `
        <tr style="border-bottom: 1px solid #e4e4e7;">
          <td style="padding:10px 8px;font-family:${F};font-size:12.5px;color:#71717a;text-align:center;">${idx + 1}</td>
          <td style="padding:10px 8px;font-family:${F};font-size:12.5px;font-weight:600;color:#09090b;">
            ${it.productName}
            <div style="font-size:11px;color:#71717a;font-weight:normal;">SKU: ${it.sku || '-'}</div>
          </td>
          <td style="padding:10px 8px;font-family:${F};font-size:12.5px;color:#3f3f46;text-align:center;">${it.unit || 'Cái'}</td>
          <td style="padding:10px 8px;font-family:${F};font-size:12.5px;font-weight:700;color:#09090b;text-align:center;">${it.expectedQty || it.quantity || 1}</td>
          <td style="padding:10px 8px;font-family:${F};font-size:12.5px;color:#3f3f46;text-align:right;">${formatCurrency(it.importPrice || 0)}</td>
          <td style="padding:10px 8px;font-family:${F};font-size:12.5px;font-weight:700;color:${primaryColor};text-align:right;">${formatCurrency(it.subtotal || 0)}</td>
        </tr>
      `
        )
        .join('');

      return {
        subject: finalSubject,
        bodyHtml: `
          <h2 style="margin:0 0 6px;font-family:${F};font-size:20px;font-weight:700;color:#09090b;">Đơn đặt mua hàng #${poNumber}</h2>
          ${greetingHtml}

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;margin:0 0 20px;">
            <thead>
              <tr style="background:#fafafa;border-bottom:1px solid #e4e4e7;">
                <th style="padding:10px 8px;font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-align:center;">STT</th>
                <th style="padding:10px 8px;font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-align:left;">Sản phẩm / SKU</th>
                <th style="padding:10px 8px;font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-align:center;">ĐVT</th>
                <th style="padding:10px 8px;font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-align:center;">SL Đặt</th>
                <th style="padding:10px 8px;font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-align:right;">Đơn giá</th>
                <th style="padding:10px 8px;font-family:${F};font-size:11px;font-weight:700;color:#71717a;text-align:right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#fafafa;border-top:1px solid #e4e4e7;">
                <td colspan="4" style="padding:12px 8px;font-family:${F};font-size:13px;font-weight:700;color:#09090b;text-align:right;">Tổng giá trị đặt mua:</td>
                <td colspan="2" style="padding:12px 8px;font-family:${F};font-size:15px;font-weight:800;color:${primaryColor};text-align:right;">${formatCurrency(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 16px;margin:0 0 20px;font-size:12.5px;color:#475569;line-height:1.6;">
            ${specialNote}
          </div>

          <p style="margin:0;font-family:${F};font-size:12.5px;color:#71717a;line-height:1.6;">
            ${footerNote}
          </p>
        `,
      };
    },
  },
];

module.exports = procurementTemplates;
