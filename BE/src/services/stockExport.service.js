const StockExport = require('../models/stockExport.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const StockMovement = require('../models/stockMovement.model');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

class StockExportService {
  static async getStockExports({ page = 1, limit = 20, keyword = '', type }) {
    const query = {};
    if (type) query.type = type;
    if (keyword) {
      query.$or = [
        { exportNumber: { $regex: keyword, $options: 'i' } },
        { recipientName: { $regex: keyword, $options: 'i' } },
        { recipientPhone: { $regex: keyword, $options: 'i' } },
        { note: { $regex: keyword, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      StockExport.find(query)
        .populate('createdById', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockExport.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getStockExportById(id) {
    const stockExport = await StockExport.findById(id).populate('createdById', 'name email');
    if (!stockExport) throw new AppError('Phiếu xuất kho không tồn tại', 404);
    return stockExport;
  }

  static async createStockExport(payload, userId) {
    const { type = 'sale', recipientName, recipientPhone, recipientAddress, note, items } = payload;
    if (!items || items.length === 0) {
      throw new AppError('Danh sách sản phẩm xuất kho không được để trống', 400);
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await StockExport.countDocuments();
    const exportNumber = `EX-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    let totalQuantity = 0;
    let totalAmount = 0;

    const formattedItems = items.map((item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.exportPrice || 0);
      const sub = qty * price;

      totalQuantity += qty;
      totalAmount += sub;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        sku: item.sku || '',
        productName: item.productName || 'Sản phẩm',
        unit: item.unit || 'Cái',
        quantity: qty,
        exportPrice: price,
        subtotal: sub,
      };
    });

    const stockExport = await StockExport.create({
      exportNumber,
      type,
      status: 'pending_pick',
      recipientName: recipientName || '',
      recipientPhone: recipientPhone || '',
      recipientAddress: recipientAddress || '',
      note: note || '',
      items: formattedItems,
      totalQuantity,
      totalAmount,
      createdById: userId,
      activityLogs: [
        {
          status: 'pending_pick',
          note: 'Hệ thống tự động sinh Lệnh xuất kho',
          performedBy: userId,
          createdAt: new Date(),
        },
      ],
    });

    try {
      const { workbook } = await this.generateExcelSlip(stockExport._id);
      const buffer = await workbook.xlsx.writeBuffer();
      const folderPath = `inventory_archives/stock_exports`;
      const result = await uploadRawToCloudinary(buffer, folderPath);
      if (result?.secure_url) {
        stockExport.documentUrl = result.secure_url;
        stockExport.documentPublicId = result.public_id;
        await stockExport.save();
      }
    } catch (err) {
      console.error(`[Archive-Error] Upload Export ${exportNumber} to Cloudinary failed:`, err.message);
    }

    return stockExport;
  }

  /**
   * Cập nhật quy trình 4 bước của Lệnh xuất kho (pending_pick -> picking -> packed -> completed)
   */
  static async updateStatus(id, newStatus, note, userId) {
    const se = await StockExport.findById(id);
    if (!se) throw new AppError('Phiếu xuất kho không tồn tại', 404);

    if (se.status === 'completed' || se.status === 'cancelled') {
      throw new AppError(`Lệnh xuất kho đã ${se.status === 'completed' ? 'Hoàn thành' : 'Hủy'}, không thể thay đổi`, 400);
    }

    const statusLabels = {
      pending_pick: 'Chờ soạn hàng',
      picking: 'Đang lấy hàng',
      packed: 'Đã đóng gói',
      completed: 'Hoàn thành xuất kho',
      cancelled: 'Hủy lệnh xuất kho',
    };

    se.status = newStatus;
    se.activityLogs.push({
      status: newStatus,
      note: note || `Chuyển trạng thái sang ${statusLabels[newStatus] || newStatus}`,
      performedBy: userId,
      createdAt: new Date(),
    });

    if (newStatus === 'completed') {
      const variantIds = se.items.filter((i) => i.variantId).map((i) => i.variantId);
      const productIds = se.items.filter((i) => !i.variantId && i.productId).map((i) => i.productId);

      const [variantsList, productsList] = await Promise.all([
        variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }) : [],
        productIds.length > 0 ? Product.find({ _id: { $in: productIds } }) : [],
      ]);

      const variantMap = new Map(variantsList.map((v) => [v._id.toString(), v]));
      const productMap = new Map(productsList.map((p) => [p._id.toString(), p]));

      const variantBulkOps = [];
      const productBulkOps = [];
      const movementDocs   = [];

      for (const item of se.items) {
        if (item.variantId) {
          const variant = variantMap.get(item.variantId.toString());
          if (variant) {
            const beforeStock = variant.stock || 0;
            const afterStock  = Math.max(0, beforeStock - item.quantity);
            variantBulkOps.push({
              updateOne: {
                filter: { _id: item.variantId },
                update: { $set: { stock: afterStock } },
              },
            });
            movementDocs.push({
              type: 'EXPORT',
              productId: item.productId,
              variantId: item.variantId,
              sku: item.sku,
              productName: item.productName,
              beforeStock,
              changeQty: -item.quantity,
              afterStock,
              referenceNumber: se.exportNumber,
              reason: `Xuất kho (${se.type}) - Đơn ${se.exportNumber}`,
              createdById: userId,
            });
          }
        } else {
          const product = productMap.get(item.productId.toString());
          if (product) {
            const beforeStock = product.stock || 0;
            const afterStock  = Math.max(0, beforeStock - item.quantity);
            productBulkOps.push({
              updateOne: {
                filter: { _id: item.productId },
                update: { $set: { stock: afterStock } },
              },
            });
            movementDocs.push({
              type: 'EXPORT',
              productId: item.productId,
              sku: item.sku,
              productName: item.productName,
              beforeStock,
              changeQty: -item.quantity,
              afterStock,
              referenceNumber: se.exportNumber,
              reason: `Xuất kho (${se.type}) - Đơn ${se.exportNumber}`,
              createdById: userId,
            });
          }
        }
      }

      // Thực hiện trong 3 DB calls thay vì N*2 calls
      await Promise.all([
        variantBulkOps.length > 0 ? ProductVariant.bulkWrite(variantBulkOps) : Promise.resolve(),
        productBulkOps.length > 0 ? Product.bulkWrite(productBulkOps)         : Promise.resolve(),
        movementDocs.length > 0   ? StockMovement.insertMany(movementDocs, { ordered: false }) : Promise.resolve(),
      ]);
    }

    await se.save();
    return se;
  }

  // DIEN DU LIEU VAO TEMPLATE 'Phieu xuat kho.xlsx'
  // Template (inspect): A1=Don vi, A2=Bo phan, A6=Ngay, A7=So, A10=Nguoi nhan, A11=Ly do, A12=Xuat tai kho
  // R14-R16: header bang (giu nguyen), R17-R19: 3 data rows, R20: Cong row, R22: Tong tien chu
  static async generateExcelSlip(id) {
    const se = await StockExport.findById(id);
    if (!se) throw new AppError('Phieu xuat kho khong ton tai', 404);

    const templatePath = path.join(__dirname, '../template/Phieu xuat kho.xlsx');
    if (!fs.existsSync(templatePath)) {
      throw new AppError('Khong tim thay file mau Phieu xuat kho.xlsx', 500);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const sheet = workbook.worksheets[0];

    const d = new Date(se.createdAt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();

    const NUM_FMT = '#,##0';
    const CELL_BORDER = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };

    // === BUOC 1: Dien header ===
    sheet.getCell('A1').value = 'Đơn vị: CÔNG TY ĐIỆN MÁY SHOP';
    sheet.getCell('A2').value = 'Bộ phận: Kho Thành Phẩm';
    sheet.getCell('A6').value = 'Ngày ' + dd + ' tháng ' + mm + ' năm ' + yyyy;
    sheet.getCell('A7').value = '             Số: ' + se.exportNumber;
    sheet.getCell('A10').value = '- Họ và tên người nhận hàng: ' + (se.recipientName || 'Khách lẻ') + '    Địa chỉ (bộ phận): ' + (se.recipientAddress || 'TP. Hồ Chí Minh');
    sheet.getCell('A11').value = '- Lý do xuất kho: ' + (se.note || (se.type === 'sale' ? 'Xuất bán hàng' : 'Xuất điều chuyển kho'));
    sheet.getCell('A12').value = '- Xuất tại kho (ngăn lô): Kho Thành Phẩm SHOP    Địa điểm: TP. Hồ Chí Minh';

    // === BUOC 1b: Column widths ===
    sheet.getColumn(1).width = 8;   // A: STT (merged A+B)
    sheet.getColumn(2).width = 5;   // B: part of STT merge
    sheet.getColumn(3).width = 48;  // C: Ten san pham
    sheet.getColumn(4).width = 16;  // D: Ma so
    sheet.getColumn(5).width = 8;   // E: DVT
    sheet.getColumn(6).width = 13;  // F: Theo chung tu
    sheet.getColumn(7).width = 13;  // G: Thuc xuat
    sheet.getColumn(8).width = 17;  // H: Don gia
    sheet.getColumn(9).width = 18;  // I: Thanh tien

    // === BUOC 2: Xu ly data rows linh hoat ===
    const DATA_START_ROW = 17;
    const TEMPLATE_DATA_ROWS = 3;
    const itemCount = se.items.length;

    for (let r = DATA_START_ROW; r < DATA_START_ROW + TEMPLATE_DATA_ROWS; r++) {
      const row = sheet.getRow(r);
      row.eachCell({ includeEmpty: true }, (cell) => { cell.value = null; });
      row.commit();
    }

    if (itemCount > TEMPLATE_DATA_ROWS) {
      sheet.spliceRows(DATA_START_ROW + TEMPLATE_DATA_ROWS, 0, ...Array(itemCount - TEMPLATE_DATA_ROWS).fill([]));
    }

    // === BUOC 3: Dien du lieu + border + format ===
    // STT column: A (left/top/bottom border) + B (right/top/bottom border) = visual merge
    // Khong dung sheet.mergeCells() vi template da co merged cells san
    const BORDER_STT_A = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' } };
    const BORDER_STT_B = { top: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    se.items.forEach((item, index) => {
      const rowNum = DATA_START_ROW + index;
      const currentRow = sheet.getRow(rowNum);
      currentRow.getCell(1).value = index + 1;
      currentRow.getCell(2).value = null;  // B empty, khong co border giua A-B
      currentRow.getCell(3).value = item.productName || '';
      currentRow.getCell(4).value = item.sku || '';
      currentRow.getCell(5).value = item.unit || 'Cái';
      currentRow.getCell(6).value = item.quantity || 0;
      currentRow.getCell(7).value = item.quantity || 0;
      currentRow.getCell(8).value = item.exportPrice || 0;
      currentRow.getCell(9).value = item.subtotal || 0;
      currentRow.getCell(1).border = BORDER_STT_A;
      currentRow.getCell(2).border = BORDER_STT_B;
      currentRow.getCell(8).numFmt = NUM_FMT;
      currentRow.getCell(9).numFmt = NUM_FMT;
      currentRow.getCell(3).alignment = { wrapText: true, vertical: 'middle' };
      currentRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      currentRow.height = 40;
      for (let c = 3; c <= 9; c++) currentRow.getCell(c).border = CELL_BORDER;
      currentRow.commit();
    });

    // === BUOC 4: Cong row (offset sau splice) ===
    const offset = itemCount > TEMPLATE_DATA_ROWS ? itemCount - TEMPLATE_DATA_ROWS : 0;
    const congRowIdx = 20 + offset;
    const congRow = sheet.getRow(congRowIdx);
    congRow.getCell(1).border = BORDER_STT_A;
    congRow.getCell(2).border = BORDER_STT_B;
    congRow.getCell(3).value = 'Cộng';
    congRow.getCell(6).value = se.totalQuantity || 0;
    congRow.getCell(7).value = se.totalQuantity || 0;
    congRow.getCell(8).value = 'x';
    congRow.getCell(9).value = se.totalAmount || 0;
    congRow.getCell(9).numFmt = NUM_FMT;
    for (let c = 1; c <= 9; c++) congRow.getCell(c).border = CELL_BORDER;
    congRow.commit();

    // === BUOC 5: Tong tien chu ===
    const wordRowIdx = 22 + offset;
    sheet.getRow(wordRowIdx).getCell(1).value =
      '- Tổng số tiền (viết bằng chữ): ' + (se.totalAmount || 0).toLocaleString('vi-VN') + ' đồng.';
    sheet.getRow(wordRowIdx).commit();

    return { workbook, exportNumber: se.exportNumber };
  }
}

module.exports = StockExportService;
