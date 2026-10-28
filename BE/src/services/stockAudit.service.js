const StockAudit = require('../models/stockAudit.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const StockMovement = require('../models/stockMovement.model');
const StockReceiving = require('../models/stockReceiving.model');
const StockExport = require('../models/stockExport.model');
const Warehouse = require('../models/warehouse.model');
const ProductWarehouseStock = require('../models/productWarehouseStock.model');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../middleware/sanitize.middleware');

class StockAuditService {
  static async getStockAudits({ page = 1, limit = 20, keyword = '', warehouseId }) {
    const query = {};
    if (warehouseId) query.warehouseId = warehouseId;
    if (keyword) {
      const safeKw = escapeRegex(keyword);
      query.$or = [
        { auditNumber: { $regex: safeKw, $options: 'i' } },
        { note: { $regex: safeKw, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      StockAudit.find(query)
        .populate('warehouseId', 'name code phone')
        .populate('createdById', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockAudit.countDocuments(query),
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

  static async getStockAuditById(id) {
    const stockAudit = await StockAudit.findById(id)
      .populate('warehouseId', 'name code phone address')
      .populate('createdById', 'name email');
    if (!stockAudit) throw new AppError('Phiếu kiểm kê không tồn tại', 404);
    return stockAudit;
  }

  static async createStockAudit(payload, userId) {
    const { note, auditDate, items, warehouseId } = payload;
    if (!items || items.length === 0) {
      throw new AppError('Danh sách sản phẩm kiểm kê không được để trống', 400);
    }

    let targetWarehouseId = warehouseId;
    if (!targetWarehouseId) {
      const defaultWh = await Warehouse.findOne({ isDefault: true });
      targetWarehouseId = defaultWh?._id;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await StockAudit.countDocuments();
    const auditNumber = `AUD-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    let totalDifference = 0;

    const formattedItems = [];

    const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId);
    const productIds = items.filter((i) => i.productId).map((i) => i.productId);

    const [variantsList, productsList, pwStockList] = await Promise.all([
      variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }) : [],
      productIds.length > 0 ? Product.find({ _id: { $in: productIds } }) : [],
      targetWarehouseId && variantIds.length > 0
        ? ProductWarehouseStock.find({ warehouseId: targetWarehouseId, variantId: { $in: variantIds } })
        : [],
    ]);

    const variantMap = new Map(variantsList.map((v) => [v._id.toString(), v]));
    const productMap = new Map(productsList.map((p) => [p._id.toString(), p]));
    const pwStockMap = new Map(pwStockList.map((s) => [s.variantId.toString(), s]));

    for (const item of items) {
      let sysStock = Number(item.systemStock || 0);
      let price = 0;

      if (item.variantId) {
        const variant = variantMap.get(item.variantId.toString());
        if (variant) {
          price = variant.price || 0;
          if (pwStockMap.has(item.variantId.toString())) {
            sysStock = pwStockMap.get(item.variantId.toString()).stock || 0;
          } else {
            sysStock = variant.stock || 0;
          }
        }
      } else if (item.productId) {
        const product = productMap.get(item.productId.toString());
        if (product) {
          sysStock = product.stock || 0;
          price = product.price || 0;
        }
      }

      const actStock = Number(item.actualStock ?? sysStock);
      const diff = actStock - sysStock;
      totalDifference += diff;

      formattedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        sku: item.sku || '',
        productName: item.productName || 'Sản phẩm',
        price,
        systemStock: sysStock,
        actualStock: actStock,
        difference: diff,
        reason: item.reason || '',
      });
    }

    const stockAudit = await StockAudit.create({
      auditNumber,
      warehouseId: targetWarehouseId,
      note: note || '',
      auditDate: auditDate ? new Date(auditDate) : new Date(),
      items: formattedItems,
      totalDifference,
      createdById: userId,
    });

    // ── Bulk update stock + create StockMovements ──
    const pwStockBulkOps = [];
    const variantBulkOps = [];
    const productBulkOps = [];
    const movementDocs   = [];

    for (const item of formattedItems) {
      if (item.difference === 0) continue;

      if (item.variantId) {
        const variant = variantMap.get(item.variantId.toString());
        if (variant) {
          const beforeStock = item.systemStock;

          if (targetWarehouseId) {
            pwStockBulkOps.push({
              updateOne: {
                filter: { warehouseId: targetWarehouseId, variantId: item.variantId },
                update: { $set: { productId: item.productId, stock: item.actualStock } },
                upsert: true,
              },
            });
          }

          const newVariantTotal = Math.max(0, (variant.stock || 0) + item.difference);
          variantBulkOps.push({
            updateOne: {
              filter: { _id: item.variantId },
              update: { $set: { stock: newVariantTotal } },
            },
          });

          movementDocs.push({
            type: 'ADJUSTMENT',
            warehouseId: targetWarehouseId,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName,
            beforeStock,
            changeQty: item.difference,
            afterStock: item.actualStock,
            referenceNumber: auditNumber,
            reason: item.reason || `Cân bằng kho từ phiếu kiểm kê ${auditNumber}`,
            createdById: userId,
          });
        }
      }

      const product = productMap.get(item.productId.toString());
      if (product && !item.variantId) {
        const beforeStock = product.stock || 0;
        productBulkOps.push({
          updateOne: {
            filter: { _id: item.productId },
            update: { $set: { stock: item.actualStock } },
          },
        });
        movementDocs.push({
          type: 'ADJUSTMENT',
          warehouseId: targetWarehouseId,
          productId: item.productId,
          sku: item.sku,
          productName: item.productName,
          beforeStock,
          changeQty: item.difference,
          afterStock: item.actualStock,
          referenceNumber: auditNumber,
          reason: item.reason || `Cân bằng kho từ phiếu kiểm kê ${auditNumber}`,
          createdById: userId,
        });
      }
    }

    await Promise.all([
      pwStockBulkOps.length > 0 ? ProductWarehouseStock.bulkWrite(pwStockBulkOps) : Promise.resolve(),
      variantBulkOps.length > 0 ? ProductVariant.bulkWrite(variantBulkOps) : Promise.resolve(),
      productBulkOps.length > 0 ? Product.bulkWrite(productBulkOps)         : Promise.resolve(),
      movementDocs.length > 0   ? StockMovement.insertMany(movementDocs, { ordered: false }) : Promise.resolve(),
    ]);

    // Tự động sinh chứng từ bù trừ cân bằng kho (PNK cho hàng thừa, PXK cho hàng thiếu)
    try {
      const surplusItems = stockAudit.items.filter((i) => i.difference > 0);
      const deficitItems = stockAudit.items.filter((i) => i.difference < 0);

      // 1. Sinh Phiếu Nhập Kho (PNK) cân bằng nếu phát hiện hàng thừa
      if (surplusItems.length > 0) {
        const cleanCode = (auditNumber || '').replace(/^KK-?/, '');
        const recNumber = `PNK-KK-${cleanCode}`;
        await StockReceiving.create({
          receivingNumber: recNumber,
          type: 'audit_surplus',
          referenceDoc: auditNumber,
          warehouseId: targetWarehouseId,
          note: `Nhập kho tự động cân bằng hàng thừa từ kiểm kê ${auditNumber}`,
          totalQuantity: surplusItems.reduce((acc, it) => acc + it.difference, 0),
          totalAmount: 0,
          items: surplusItems.map((it) => ({
            productId: it.productId,
            variantId: it.variantId || null,
            sku: it.sku || '',
            productName: it.productName,
            unit: it.unit || 'Cái',
            expectedQty: it.difference,
            receivedQty: it.difference,
            importPrice: 0,
            subtotal: 0,
          })),
          createdBy: userId,
        }).catch((e) => console.warn('[Auto-PNK-Warn] Cannot create surplus receipt:', e.message));
      }

      // 2. Sinh Phiếu Xuất Kho (PXK) cân bằng nếu phát hiện hàng thiếu / hao hụt
      if (deficitItems.length > 0) {
        const cleanCode = (auditNumber || '').replace(/^KK-?/, '');
        const expNumber = `PXK-KK-${cleanCode}`;
        await StockExport.create({
          exportNumber: expNumber,
          type: 'audit_deficit',
          status: 'completed',
          warehouseId: targetWarehouseId,
          recipientName: 'Hao hụt kiểm kê',
          note: `Xuất kho tự động cân bằng hàng thiếu / hao hụt từ kiểm kê ${auditNumber}`,
          items: deficitItems.map((it) => ({
            productId: it.productId,
            variantId: it.variantId || null,
            sku: it.sku || '',
            productName: it.productName,
            unit: it.unit || 'Cái',
            quantity: Math.abs(it.difference),
            exportPrice: 0,
            subtotal: 0,
          })),
          activityLogs: [
            {
              status: 'completed',
              note: `Tự động xuất kho cân bằng hao hụt từ phiếu kiểm kê ${auditNumber}`,
              performedBy: userId,
            },
          ],
        }).catch((e) => console.warn('[Auto-PXK-Warn] Cannot create deficit export:', e.message));
      }
    } catch (docErr) {
      console.error('[Audit-Doc-Error] Auto generation of PNK/PXK failed:', docErr.message);
    }

    try {
      const { workbook } = await this.generateExcelSlip(stockAudit._id);
      const buffer = await workbook.xlsx.writeBuffer();
      const folderPath = `inventory_archives/stock_audits`;
      const result = await uploadRawToCloudinary(buffer, folderPath);
      if (result?.secure_url) {
        stockAudit.documentUrl = result.secure_url;
        stockAudit.documentPublicId = result.public_id;
        await stockAudit.save();
      }
    } catch (err) {
      console.error(`[Archive-Error] Upload Audit ${auditNumber} to Cloudinary failed:`, err.message);
    }

    return stockAudit;
  }

  // DIEN DU LIEU VAO TEMPLATE 'phieu kiem tra hang hoa.xlsx'
  // Template: A1=Don vi, A2=Dia chi, H5=Tieu de, A7=Thoi diem kiem ke
  // R13-R16: header (giu nguyen), R17-R18: 2 data rows, R19: Cong, N20: Ngay
  // Cols: A(1)=STT, B(2)=Ten, C(3)=SKU, D(4)=DVT, E(5)=Gia
  //        F(6)=SL-KT, G(7)=TT-KT, H(8)=SL-KK, I(9)=TT-KK
  //        J(10)=SL-Thua, K(11)=TT-Thua, L(12)=SL-Thieu, M(13)=TT-Thieu
  //        N(14)=Con tot, O(15)=Kem, P(16)=Mat
  static async generateExcelSlip(id) {
    const sa = await StockAudit.findById(id);
    if (!sa) throw new AppError('Phiếu kiểm kê không tồn tại', 404);

    const templatePath = path.join(__dirname, '../template/phieu kiem tra hang hoa.xlsx');
    if (!fs.existsSync(templatePath)) {
      throw new AppError('Không tìm thấy file mẫu phieu kiem tra hang hoa.xlsx', 500);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const sheet = workbook.worksheets[0];

    const d = new Date(sa.auditDate || sa.createdAt);
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
    sheet.getCell('A2').value = 'Địa chỉ: 01 Đại lộ Lê Duẩn, Quận 1, TP. Hồ Chí Minh';
    sheet.getCell('H5').value = `BIÊN BẢN KIỂM KÊ VẬT TƯ, CÔNG CỤ, SẢN PHẨM, HÀNG HOÁ (Mã: ${sa.auditNumber})`;
    sheet.getCell('A7').value = `- Thời điểm kiểm kê: 08 giờ 00 ngày ${dd} tháng ${mm} năm ${yyyy}`;

    // === BUOC 1b: Column widths ===
    sheet.getColumn(1).width = 5;   // A: STT
    sheet.getColumn(2).width = 50;  // B: Ten SP (rong hon)
    sheet.getColumn(3).width = 16;  // C: Ma so
    sheet.getColumn(4).width = 8;   // D: DVT
    sheet.getColumn(5).width = 16;  // E: Don gia
    sheet.getColumn(6).width = 12;  // F: SL So ke toan
    sheet.getColumn(7).width = 16;  // G: TT So ke toan
    sheet.getColumn(8).width = 12;  // H: SL Kiem ke
    sheet.getColumn(9).width = 16;  // I: TT Kiem ke
    sheet.getColumn(10).width = 12; // J: SL Thua
    sheet.getColumn(11).width = 16; // K: TT Thua
    sheet.getColumn(12).width = 12; // L: SL Thieu
    sheet.getColumn(13).width = 16; // M: TT Thieu
    sheet.getColumn(14).width = 12; // N: Con tot 100%
    sheet.getColumn(15).width = 12; // O: Kem pham chat
    sheet.getColumn(16).width = 12; // P: Mat pham chat

    // === BUOC 2: Xu ly data rows linh hoat ===
    const DATA_START_ROW = 17;
    const TEMPLATE_DATA_ROWS = 2;
    const itemCount = sa.items.length;

    for (let r = DATA_START_ROW; r < DATA_START_ROW + TEMPLATE_DATA_ROWS; r++) {
      const row = sheet.getRow(r);
      row.eachCell({ includeEmpty: true }, (cell) => { cell.value = null; });
      row.commit();
    }

    if (itemCount > TEMPLATE_DATA_ROWS) {
      sheet.spliceRows(DATA_START_ROW + TEMPLATE_DATA_ROWS, 0, ...Array(itemCount - TEMPLATE_DATA_ROWS).fill([]));
    }

    // === BUOC 3: Dien du lieu + border + format ===
    let totalSysQty = 0, totalActQty = 0;
    let totalSysAmt = 0, totalActAmt = 0;
    let totalSurplusQty = 0, totalSurplusAmt = 0;
    let totalShortQty = 0, totalShortAmt = 0;

    sa.items.forEach((item, index) => {
      const currentRow = sheet.getRow(DATA_START_ROW + index);
      const price = item.price || 0;
      const sysQty = item.systemStock || 0;
      const actQty = item.actualStock || 0;
      const sysAmt = sysQty * price;
      const actAmt = actQty * price;
      const diff = actQty - sysQty;
      const surplusQty = diff > 0 ? diff : 0;
      const surplusAmt = surplusQty * price;
      const shortQty = diff < 0 ? Math.abs(diff) : 0;
      const shortAmt = shortQty * price;

      totalSysQty += sysQty; totalActQty += actQty;
      totalSysAmt += sysAmt; totalActAmt += actAmt;
      totalSurplusQty += surplusQty; totalSurplusAmt += surplusAmt;
      totalShortQty += shortQty; totalShortAmt += shortAmt;

      currentRow.getCell(1).value = index + 1;
      currentRow.getCell(2).value = item.productName || '';
      currentRow.getCell(3).value = item.sku || '';
      currentRow.getCell(4).value = 'Cái';
      currentRow.getCell(5).value = price;
      currentRow.getCell(6).value = sysQty;
      currentRow.getCell(7).value = sysAmt;
      currentRow.getCell(8).value = actQty;
      currentRow.getCell(9).value = actAmt;
      currentRow.getCell(10).value = surplusQty > 0 ? surplusQty : '';
      currentRow.getCell(11).value = surplusQty > 0 ? surplusAmt : '';  // Thanh tien luon hien khi co SL
      currentRow.getCell(12).value = shortQty > 0 ? shortQty : '';
      currentRow.getCell(13).value = shortQty > 0 ? shortAmt : '';     // Thanh tien luon hien khi co SL
      currentRow.getCell(14).value = actQty > 0 ? actQty : '';
      currentRow.getCell(15).value = '';
      currentRow.getCell(16).value = '';

      [5, 7, 9, 11, 13].forEach((c) => { currentRow.getCell(c).numFmt = NUM_FMT; });
      currentRow.getCell(2).alignment = { wrapText: true, vertical: 'middle' };
      currentRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      currentRow.height = 50;
      for (let c = 1; c <= 16; c++) currentRow.getCell(c).border = CELL_BORDER;
      currentRow.commit();
    });

    // === BUOC 4: Cong row (offset sau splice) ===
    const offset = itemCount > TEMPLATE_DATA_ROWS ? itemCount - TEMPLATE_DATA_ROWS : 0;
    const congRowIdx = 19 + offset;
    const congRow = sheet.getRow(congRowIdx);
    congRow.getCell(2).value = 'Cộng';
    congRow.getCell(5).value = 'x';
    congRow.getCell(6).value = totalSysQty;
    congRow.getCell(7).value = totalSysAmt;
    congRow.getCell(8).value = 'x';
    congRow.getCell(9).value = totalActAmt;
    congRow.getCell(10).value = 'x';
    congRow.getCell(11).value = totalSurplusAmt || 'x';
    congRow.getCell(12).value = 'x';
    congRow.getCell(13).value = totalShortAmt || 'x';
    congRow.getCell(14).value = 'x';
    congRow.getCell(15).value = 'x';
    congRow.getCell(16).value = 'x';
    [7, 9, 11, 13].forEach((c) => {
      if (typeof congRow.getCell(c).value === 'number') congRow.getCell(c).numFmt = NUM_FMT;
    });
    for (let c = 1; c <= 16; c++) congRow.getCell(c).border = CELL_BORDER;
    congRow.commit();

    // === BUOC 5: Ngay thang nam ===
    const dateRowIdx = 20 + offset;
    sheet.getRow(dateRowIdx).getCell(14).value = `TP. Hồ Chí Minh, ngày ${dd} tháng ${mm} năm ${yyyy}`;
    sheet.getRow(dateRowIdx).commit();

    return { workbook, auditNumber: sa.auditNumber };
  }
}

module.exports = StockAuditService;
