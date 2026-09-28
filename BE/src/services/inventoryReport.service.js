const ExcelJS = require('exceljs');
const ProductVariant = require('../models/productVariant.model');
const StockMovement = require('../models/stockMovement.model');
const PurchaseOrder = require('../models/purchaseOrder.model');
const StockExport = require('../models/stockExport.model');

/**
 * Tính toán Bảng Tổng hợp Vật tư Nhập - Xuất - Tồn trong khoảng thời gian.
 * Công thức: Tồn cuối kỳ = Tồn đầu kỳ + Nhập trong kỳ - Xuất trong kỳ
 */
const getInventoryBalanceReport = async (query = {}) => {
  const { startDate, endDate, keyword } = query;

  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Lấy tất cả biến thể sản phẩm (kèm thông tin sản phẩm cha)
  const variantQuery = {};
  if (keyword) {
    const regex = new RegExp(keyword.trim(), 'i');
    variantQuery.$or = [{ sku: regex }, { displayName: regex }];
  }

  const variants = await ProductVariant.find(variantQuery)
    .populate('productId', 'name productCode code price costPrice unit')
    .sort({ createdAt: -1 })
    .limit(5000); // soft cap — tránh load toàn bộ catalog vào memory

  const variantIds = variants.map((v) => v._id);

  // 2. Lấy các chuyển động kho TRƯỚC thời gian bắt đầu (để tính Tồn Đầu Kỳ)
  const movementsBefore = await StockMovement.aggregate([
    { $match: { variantId: { $in: variantIds }, createdAt: { $lt: start } } },
    {
      $group: {
        _id: '$variantId',
        netQty: { $sum: '$changeQty' },
      },
    },
  ]);

  const beforeMap = {};
  movementsBefore.forEach((m) => {
    beforeMap[m._id.toString()] = m.netQty;
  });

  // 3. Lấy các chuyển động kho TRONG khoảng thời gian (để tính Nhập & Xuất trong kỳ)
  const movementsPeriod = await StockMovement.aggregate([
    {
      $match: {
        variantId: { $in: variantIds },
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$variantId',
        totalIn: {
          $sum: {
            $cond: [{ $gt: ['$changeQty', 0] }, '$changeQty', 0],
          },
        },
        totalOut: {
          $sum: {
            $cond: [{ $lt: ['$changeQty', 0] }, { $abs: '$changeQty' }, 0],
          },
        },
      },
    },
  ]);

  const periodMap = {};
  movementsPeriod.forEach((m) => {
    periodMap[m._id.toString()] = { inQty: m.totalIn, outQty: m.totalOut };
  });

  // 4. Tổng hợp báo cáo cho từng vật tư
  const items = [];
  let grandOpeningAmount = 0;
  let grandInAmount = 0;
  let grandOutAmount = 0;
  let grandClosingAmount = 0;

  let sttCounter = 1;
  variants.forEach((v) => {
    if (!v.productId) return;

    const prod = v.productId;
    const isCustomVariant = !v.isDefault;
    const name = isCustomVariant
      ? `${prod.name} (${v.displayName || v.sku || 'Biến thể'})`
      : prod.name;

    const sku = v.sku || prod.productCode || prod.code || 'N/A';
    const unit = v.unit || prod.unit || 'Cái';
    const unitPrice = v.costPrice || prod.costPrice || v.price || prod.price || 0;

    // Tồn hiện tại trên DB chính là Tồn cuối kỳ thời điểm hiện tại
    const currentStock = v.stock || 0;

    // Nếu thời gian kết thúc lọc là tương lai / hiện tại, ta dùng chuyển động kho để suy ra Tồn Đầu Kỳ & Tồn Cuối Kỳ
    const periodData = periodMap[v._id.toString()] || { inQty: 0, outQty: 0 };
    const inQty = periodData.inQty || 0;
    const outQty = periodData.outQty || 0;

    // Tồn đầu kỳ = Tồn hiện tại trừ cho (Nhập - Xuất từ đầu kỳ đến hiện tại)
    const netBefore = beforeMap[v._id.toString()] || 0;
    // Để đảm bảo chính xác: Tồn cuối = currentStock (nếu end >= now) hoặc tính lùi
    const closingQty = currentStock;
    const openingQty = Math.max(0, closingQty - (inQty - outQty));

    const openingAmount = openingQty * unitPrice;
    const inAmount = inQty * unitPrice;
    const outAmount = outQty * unitPrice;
    const closingAmount = closingQty * unitPrice;

    grandOpeningAmount += openingAmount;
    grandInAmount += inAmount;
    grandOutAmount += outAmount;
    grandClosingAmount += closingAmount;

    items.push({
      stt: sttCounter++,
      variantId: v._id,
      sku,
      name,
      unit,
      unitPrice,
      openingQty,
      openingAmount,
      inQty,
      inAmount,
      outQty,
      outAmount,
      closingQty,
      closingAmount,
    });
  });

  return {
    period: {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    },
    totals: {
      grandOpeningAmount,
      grandInAmount,
      grandOutAmount,
      grandClosingAmount,
    },
    items,
  };
};

/**
 * Xuất Bảng Tổng Hợp Vật Tư Nhập Xuất Tồn ra file Excel (.xlsx) chuẩn Kế Toán
 */
const exportInventoryReportExcel = async (query = {}, res) => {
  const reportData = await getInventoryBalanceReport(query);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Clone Haravan ERP';
  workbook.lastModifiedBy = 'Admin';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Nhập Xuất Tồn', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Styles & Palette
  const orangeHeaderFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE67E22' }, // Soft Professional Orange
  };

  const graySubHeaderFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };

  const totalRowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFDF2E9' },
  };

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  };

  // Title Row
  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'BẢNG TỔNG HỢP VẬT TƯ NHẬP XUẤT TỒN';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1F2937' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Subtitle Date Range Row
  worksheet.mergeCells('A2:L2');
  const dateCell = worksheet.getCell('A2');
  const sDateStr = new Date(reportData.period.startDate).toLocaleDateString('vi-VN');
  const eDateStr = new Date(reportData.period.endDate).toLocaleDateString('vi-VN');
  dateCell.value = `Từ ngày: ${sDateStr}  -  Đến ngày: ${eDateStr}`;
  dateCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF4B5563' } };
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 20;

  worksheet.addRow([]); // Row 3 empty

  // Header Rows (Rows 4 & 5 - 8 Cột kép kế toán)
  worksheet.mergeCells('A4:A5');
  worksheet.getCell('A4').value = 'STT';

  worksheet.mergeCells('B4:B5');
  worksheet.getCell('B4').value = 'Mã VT';

  worksheet.mergeCells('C4:C5');
  worksheet.getCell('C4').value = 'Tên vật tư';

  worksheet.mergeCells('D4:D5');
  worksheet.getCell('D4').value = 'Đơn vị';

  worksheet.mergeCells('E4:F4');
  worksheet.getCell('E4').value = 'Tồn đầu kỳ';
  worksheet.getCell('E5').value = 'Số lượng';
  worksheet.getCell('F5').value = 'Thành tiền';

  worksheet.mergeCells('G4:H4');
  worksheet.getCell('G4').value = 'Nhập trong kỳ';
  worksheet.getCell('G5').value = 'Số lượng';
  worksheet.getCell('H5').value = 'Thành tiền';

  worksheet.mergeCells('I4:J4');
  worksheet.getCell('I4').value = 'Xuất trong kỳ';
  worksheet.getCell('I5').value = 'Số lượng';
  worksheet.getCell('J5').value = 'Thành tiền';

  worksheet.mergeCells('K4:L4');
  worksheet.getCell('K4').value = 'Tồn cuối kỳ';
  worksheet.getCell('K5').value = 'Số lượng';
  worksheet.getCell('L5').value = 'Thành tiền';

  // Apply styles to Header Rows 4 & 5
  [4, 5].forEach((rowNum) => {
    const row = worksheet.getRow(rowNum);
    row.height = 22;
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.fill = orangeHeaderFill;
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = thinBorder;
    });
  });

  // Grand Total Summary Row (Row 6)
  const totalRow = worksheet.addRow([
    '',
    '',
    'Tổng cộng:',
    '',
    '',
    reportData.totals.grandOpeningAmount,
    '',
    reportData.totals.grandInAmount,
    '',
    reportData.totals.grandOutAmount,
    '',
    reportData.totals.grandClosingAmount,
  ]);
  totalRow.height = 24;

  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.fill = totalRowFill;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFC0392B' } };
    cell.border = thinBorder;
    if (colNumber === 3) {
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = '#,##0 "đ"';
    }
  });

  // Populate Item Rows
  reportData.items.forEach((item) => {
    const row = worksheet.addRow([
      item.stt,
      item.sku,
      item.name,
      item.unit,
      item.openingQty,
      item.openingAmount,
      item.inQty,
      item.inAmount,
      item.outQty,
      item.outAmount,
      item.closingQty,
      item.closingAmount,
    ]);

    row.height = 20;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10 };
      cell.border = thinBorder;

      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2 || colNumber === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if ([5, 7, 9, 11].includes(colNumber)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
      } else {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0 "đ"';
      }
    });
  });

  // Auto column width adjustment
  worksheet.columns.forEach((column, colIdx) => {
    let maxLen = 12;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLen) maxLen = len;
    });
    if (colIdx === 2) column.width = Math.min(maxLen + 4, 38); // Tên VT
    else if ([5, 6, 7, 8, 9, 10, 11, 12].includes(colIdx + 1)) column.width = 16;
    else column.width = Math.max(maxLen + 3, 10);
  });

  // Set Response Stream Headers
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Bang-Tong-Hop-Nhap-Xuat-Ton_${Date.now()}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  getInventoryBalanceReport,
  exportInventoryReportExcel,
};
