const F = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

/**
 * Khung HTML chuẩn cho mọi Email giao dịch (Responsive, Flat, Brand Color)
 */
const emailShell = ({ shopName, supportEmail, logoUrl, logoWidth = 180, primaryColor = '#0088ff', categoryLabel = 'Đơn hàng', bodyHtml }) => `<!DOCTYPE html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f5">
  <tr><td align="center" style="padding:28px 12px 36px;">

    <!-- CARD CONTAINER -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;">

      <!-- HEADER LOGO -->
      <tr>
        <td style="padding:20px 28px;border-bottom:1px solid #f4f4f5;background:#ffffff;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                ${logoUrl
    ? `<img src="${logoUrl}" width="${logoWidth}" style="max-width:${logoWidth}px;height:auto;display:block;border:0;" alt="${shopName}" />`
    : `<span style="font-family:${F};font-size:18px;font-weight:700;color:${primaryColor};letter-spacing:-0.3px;">${shopName}</span>`
  }
              </td>
              <td align="right" valign="middle">
                <span style="font-family:${F};font-size:11px;font-weight:600;color:#71717a;letter-spacing:0.4px;text-transform:uppercase;">${categoryLabel}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY CONTENT -->
      <tr>
        <td style="padding:28px 28px 24px;">
          ${bodyHtml}
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding:16px 28px 20px;border-top:1px solid #f4f4f5;background:#fafafa;">
          <p style="margin:0 0 6px;font-family:${F};font-size:11.5px;color:#71717a;line-height:1.6;">
            &copy; ${new Date().getFullYear()} ${shopName}. Email thông báo tự động từ Shop, vui lòng không trả lời trực tiếp email này.
          </p>
          <p style="margin:0;font-family:${F};font-size:11.5px;color:#71717a;">
            Nếu bạn cần hỗ trợ, Shop luôn sẵn sàng tại: <a href="mailto:${supportEmail}" style="color:${primaryColor};text-decoration:none;font-weight:600;">${supportEmail}</a>
          </p>
        </td>
      </tr>

    </table>

  </td></tr>
</table>
</body>
</html>`;

/**
 * Nút kêu gọi hành động (CTA Button)
 */
const renderCTAButton = ({ url, text, primaryColor }) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 26px;">
    <tr>
      <td align="center">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:13px 34px;background:${primaryColor};color:#ffffff;font-family:${F};font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.2px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

/**
 * Khối 2 cột thông tin người mua và địa chỉ
 */
const renderTwoColSection = ({ col1Title, col1Content, col2Title, col2Content }) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid #e4e4e7;border-radius:6px;background:#fafafa;">
    <tr>
      <td width="50%" valign="top" style="padding:14px 16px;border-right:1px solid #e4e4e7;">
        <div style="font-family:${F};font-size:11px;font-weight:700;text-transform:uppercase;color:#71717a;letter-spacing:0.4px;margin-bottom:6px;">
          ${col1Title}
        </div>
        <div style="font-family:${F};font-size:12.5px;color:#27272a;line-height:1.65;">
          ${col1Content}
        </div>
      </td>
      <td width="50%" valign="top" style="padding:14px 16px;">
        <div style="font-family:${F};font-size:11px;font-weight:700;text-transform:uppercase;color:#71717a;letter-spacing:0.4px;margin-bottom:6px;">
          ${col2Title}
        </div>
        <div style="font-family:${F};font-size:12.5px;color:#27272a;line-height:1.65;">
          ${col2Content}
        </div>
      </td>
    </tr>
  </table>
`;

/**
 * Bảng hiển thị danh sách sản phẩm (có ảnh, SKU, đơn giá)
 */
const renderItemsListTable = (items, primaryColor) => {
  const rows = (items || []).map((it) => {
    const imgHtml = it.image
      ? `<img src="${it.image}" width="60" height="60" style="width:60px;height:60px;object-fit:cover;border-radius:4px;border:1px solid #ebeff2;display:block;" alt="${it.productName}" />`
      : `<div style="width:60px;height:60px;background:#f8fafc;border-radius:4px;border:1px solid #e2e8f0;display:table-cell;vertical-align:middle;text-align:center;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>`;

    return `
      <tr>
        <td width="68" valign="top" style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
          ${imgHtml}
        </td>
        <td valign="top" style="padding:12px 12px;border-bottom:1px solid #f4f4f5;">
          <div style="font-family:${F};font-size:13.5px;font-weight:700;color:#09090b;line-height:1.4;">
            ${it.productName}
          </div>
          ${it.variantName ? `<div style="font-family:${F};font-size:12px;color:#52525b;margin-top:2px;">Phân loại: ${it.variantName}</div>` : ''}
          ${it.sku ? `<div style="font-family:${F};font-size:11px;color:#71717a;font-family:monospace;margin-top:2px;">Mã SKU: ${it.sku}</div>` : ''}
          <div style="font-family:${F};font-size:12px;color:#71717a;margin-top:4px;">
            ${formatCurrency(it.unitPrice)} &times; ${it.quantity}
          </div>
        </td>
        <td width="110" align="right" valign="top" style="padding:12px 0;border-bottom:1px solid #f4f4f5;font-family:${F};font-size:13.5px;font-weight:700;color:#09090b;">
          ${formatCurrency(it.subtotal || it.unitPrice * it.quantity)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
      ${rows}
    </table>
  `;
};

/**
 * Bảng tổng kết tài chính (Tạm tính, Giảm giá, Phí ship, Tổng cộng)
 */
const renderFinancialSummary = ({ subtotal, discount = 0, shippingFee = 0, totalAmount, primaryColor }) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e4e4e7;padding-top:12px;margin:0 0 20px;">
    <tr>
      <td style="padding:4px 0;font-family:${F};font-size:13px;color:#71717a;">Tạm tính:</td>
      <td align="right" style="padding:4px 0;font-family:${F};font-size:13px;color:#09090b;font-weight:600;">${formatCurrency(subtotal)}</td>
    </tr>
    ${discount > 0 ? `
    <tr>
      <td style="padding:4px 0;font-family:${F};font-size:13px;color:#16a34a;">Giảm giá khuyến mãi:</td>
      <td align="right" style="padding:4px 0;font-family:${F};font-size:13px;color:#16a34a;font-weight:600;">-${formatCurrency(discount)}</td>
    </tr>
    ` : ''}
    <tr>
      <td style="padding:4px 0;font-family:${F};font-size:13px;color:#71717a;">Phí vận chuyển:</td>
      <td align="right" style="padding:4px 0;font-family:${F};font-size:13px;color:#09090b;font-weight:600;">${shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0 0;font-family:${F};font-size:14px;font-weight:700;color:#09090b;border-top:1.5px solid #e4e4e7;">Tổng cộng thanh toán:</td>
      <td align="right" style="padding:10px 0 0;font-family:${F};font-size:17px;font-weight:800;color:${primaryColor};border-top:1.5px solid #e4e4e7;">${formatCurrency(totalAmount)}</td>
    </tr>
  </table>
`;

/**
 * Chân thư chăm sóc khách hàng
 */
const renderEmailFooterNote = (shopName) => `
  <div style="border-top:1px solid #f4f4f5;padding-top:16px;margin-top:20px;">
    <p style="margin:0 0 6px;font-family:${F};font-size:12.5px;color:#71717a;line-height:1.6;">
      Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, đừng ngần ngại phản hồi trực tiếp email này để được hỗ trợ nhanh nhất.
    </p>
    <p style="margin:0;font-family:${F};font-size:12.5px;color:#3f3f46;line-height:1.6;">
      Trân trọng cảm ơn bạn,<br/>
      <strong>Đội ngũ chăm sóc khách hàng ${shopName}</strong>
    </p>
  </div>
`;

/**
 * Phân loại nhãn hiển thị góc trên email
 */
const getCategoryLabel = (group) => {
  if (group === 'shipping') return 'Vận chuyển';
  if (group === 'account') return 'Tài khoản';
  if (group === 'admin') return 'Hệ thống';
  return 'Đơn hàng';
};

const replacePlaceholders = (templateStr, vars = {}) => {
  if (!templateStr || typeof templateStr !== 'string') return '';
  return templateStr.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : match;
  });
};

module.exports = {
  F,
  formatCurrency,
  emailShell,
  renderCTAButton,
  renderTwoColSection,
  renderItemsListTable,
  renderFinancialSummary,
  renderEmailFooterNote,
  getCategoryLabel,
  replacePlaceholders,
};
