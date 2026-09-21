function generatePOEmailHTML({ po, supplier, customNote = '' }) {
  const items = po.items || [];
  const poNumber = po.poNumber || 'PO-XXXXXX';
  const supplierName = supplier?.name || po.supplierId?.name || 'Kính gửi Quý Nhà Cung Cấp';
  const totalAmountStr = (po.totalAmount || 0).toLocaleString('vi-VN') + ' đ';
  const orderDateStr = new Date(po.createdAt || Date.now()).toLocaleDateString('vi-VN');

  const itemsTableRows = items
    .map((item, idx) => {
      const priceStr = (item.importPrice || 0).toLocaleString('vi-VN') + ' đ';
      const subtotalStr = (item.subtotal || 0).toLocaleString('vi-VN') + ' đ';
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; text-align: center; color: #64748b; font-size: 13px;">${idx + 1}</td>
          <td style="padding: 10px 12px; font-weight: 600; color: #0f172a; font-size: 13px;">
            ${item.productName || 'Sản phẩm'}
            <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">SKU: ${item.sku || '-'}</div>
          </td>
          <td style="padding: 10px 12px; text-align: center; color: #475569; font-size: 13px;">${item.unit || 'Cái'}</td>
          <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: #0f172a; font-size: 13px;">${item.expectedQty || item.quantity || 1}</td>
          <td style="padding: 10px 12px; text-align: right; color: #475569; font-size: 13px;">${priceStr}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #16a34a; font-size: 13px;">${subtotalStr}</td>
        </tr>
      `;
    })
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Đơn Đặt Hàng - ${poNumber}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; color: #334155;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 24px 0;">
      <tr>
        <td align="center">
          <table width="640" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px 32px; color: #ffffff;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #38bdf8;">EGA  PROCUREMENT</div>
                      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Hệ Thống Quản Lý Đơn Đặt Hàng & Nhập Kho Enterprise</div>
                    </td>
                    <td align="right">
                      <div style="display: inline-block; background-color: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                        ${poNumber}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 28px 32px;">
                <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
                  Kính gửi: ${supplierName}
                </div>
                <div style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
                  Bộ phận Mua Hàng & Quản Lý Kho công ty **EGA** xin trân trọng gửi tới Quý Nhà Cung Cấp đơn đặt mua hàng chính thức số <strong>${poNumber}</strong> ngày ${orderDateStr}. Kính đề nghị Quý đối tác xác nhận và sắp xếp giao hàng theo đúng số lượng và đơn giá thỏa thuận.
                </div>

                ${customNote ? `
                <div style="background-color: #f1f5f9; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 13px; color: #334155; line-height: 1.5;">
                  <strong>Ghi chú bổ sung từ Bộ Phận Mua Hàng:</strong><br/>
                  ${customNote}
                </div>
                ` : ''}

                <!-- Items Table -->
                <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px;">
                  CHI TIẾT DANH MỤC HÀNG HÓA ĐẶT MUA:
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                  <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                      <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">STT</th>
                      <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Sản Phẩm / SKU</th>
                      <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">ĐVT</th>
                      <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">SL Đặt</th>
                      <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Đơn Giá</th>
                      <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsTableRows}
                  </tbody>
                  <tfoot>
                    <tr style="background-color: #f1f5f9; font-weight: 700;">
                      <td colspan="4" style="padding: 12px; text-align: right; color: #0f172a; font-size: 13px;">TỔNG GIÁ TRỊ ĐƠN HÀNG:</td>
                      <td colspan="2" style="padding: 12px; text-align: right; color: #16a34a; font-size: 15px;">${totalAmountStr}</td>
                    </tr>
                  </tfoot>
                </table>

                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                  <div style="font-size: 13px; color: #1e40af; font-weight: 600; margin-bottom: 6px;">
                    Cần xem hoặc tải file Phiếu Nhập Kho (.xlsx) mẫu đối chiếu?
                  </div>
                  <div style="font-size: 12px; color: #3b82f6;">
                    Đơn hàng đã được xuất sẵn định dạng chứng từ Excel chuẩn Bộ Tài Chính trên hệ thống.
                  </div>
                </div>

                <div style="font-size: 13px; color: #64748b; line-height: 1.6; border-t: 1px solid #e2e8f0; padding-top: 16px;">
                  Trân trọng cảm ơn Quý Nhà Cung Cấp đối tác!<br/>
                  <strong>Phòng Cung Ứng & Quản Lý Kho Thành Phẩm — EGA</strong>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                Thư này được phát tự động từ Hệ Thống ERP EGA. Mọi thắc mắc xin vui lòng liên hệ phòng mua hàng qua hotline hoặc email này.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

module.exports = { generatePOEmailHTML };
