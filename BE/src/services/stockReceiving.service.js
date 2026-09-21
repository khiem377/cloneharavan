const StockReceiving = require('../models/stockReceiving.model');
const PurchaseOrder = require('../models/purchaseOrder.model');
const ProductVariant = require('../models/productVariant.model');
const Product = require('../models/product.model');
const StockMovement = require('../models/stockMovement.model');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Tự sinh mã Phiếu Nhập Kho (PNK-YYYYMMDD-XXX)
 */
const generateReceivingNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `PNK-${dateStr}-`;
  const latest = await StockReceiving.findOne({ receivingNumber: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 });

  let seq = 1;
  if (latest && latest.receivingNumber) {
    const parts = latest.receivingNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }
  return `${prefix}${seq.toString().padStart(3, '0')}`;
};

/**
 * Lập Phiếu Nhập Kho (PNK) từ Đơn Mua Hàng (PO)
 */
const createStockReceiving = async (data, userId) => {
  const { purchaseOrderId, note, items } = data;

  const po = await PurchaseOrder.findById(purchaseOrderId);
  if (!po) {
    throw new Error('Đơn mua hàng không tồn tại');
  }

  if (po.status === 'cancelled') {
    throw new Error('Không thể nhập kho từ Đơn mua hàng đã bị hủy');
  }

  if (!items || items.length === 0) {
    throw new Error('Danh sách hàng thực nhập không được để trống');
  }

  const receivingNumber = await generateReceivingNumber();

  let totalQuantity = 0;
  let totalAmount = 0;
  const processedItems = [];

  const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId);
  const productIds = items.filter((i) => !i.variantId && i.productId).map((i) => i.productId);

  const [variantsList, productsList] = await Promise.all([
    variantIds.length > 0 ? ProductVariant.find({ _id: { $in: variantIds } }) : [],
    productIds.length > 0 ? Product.find({ _id: { $in: productIds } }) : [],
  ]);

  const variantMap = new Map(variantsList.map((v) => [v._id.toString(), v]));
  const productMap = new Map(productsList.map((p) => [p._id.toString(), p]));

  for (const item of items) {
    const recQty = Number(item.receivedQty || 0);
    if (recQty <= 0) continue;

    const price = Number(item.importPrice || 0);
    const itemSubtotal = recQty * price;

    totalQuantity += recQty;
    totalAmount += itemSubtotal;

    processedItems.push({
      productId: item.productId,
      variantId: item.variantId || null,
      sku: item.sku || '',
      productName: item.productName,
      unit: item.unit || 'Cái',
      location: item.location || 'Kho Tổng',
      expectedQty: Number(item.expectedQty || recQty),
      receivedQty: recQty,
      importPrice: price,
      subtotal: itemSubtotal,
    });

    const poItemIndex = po.items.findIndex(
      (pi) => pi.productId.toString() === item.productId.toString() &&
        (pi.variantId ? pi.variantId.toString() === (item.variantId || '').toString() : true)
    );

    if (poItemIndex > -1) {
      po.items[poItemIndex].receivedQty = (po.items[poItemIndex].receivedQty || 0) + recQty;
    }

    if (item.variantId) {
      const variant = variantMap.get(item.variantId.toString());
      if (variant) {
        const oldStock = variant.stock || 0;
        variant.stock = oldStock + recQty;
        if (price > 0) variant.costPrice = price;
        await variant.save();

        await StockMovement.create({
          variantId: variant._id,
          type: 'INBOUND_PO',
          changeQty: recQty,
          previousStock: oldStock,
          newStock: variant.stock,
          referenceDoc: receivingNumber,
          note: `Nhập kho từ PO ${po.poNumber}`,
          createdBy: userId,
        });
      }
    } else {
      const prod = productMap.get(item.productId.toString());
      if (prod) {
        const oldStock = prod.stock || 0;
        prod.stock = oldStock + recQty;
        if (price > 0) prod.costPrice = price;
        await prod.save();
      }
    }
  }

  // 3. Cập nhật Trạng thái PurchaseOrder (Completed nếu đủ, Partial nếu chưa đủ)
  let allCompleted = true;
  for (const pi of po.items) {
    if ((pi.receivedQty || 0) < pi.expectedQty) {
      allCompleted = false;
      break;
    }
  }

  po.status = allCompleted ? 'completed' : 'partial_received';
  if (allCompleted) po.receivedAt = new Date();
  await po.save();

  // 4. Lưu Phiếu Nhập Kho PNK
  const receiving = await StockReceiving.create({
    receivingNumber,
    purchaseOrderId: po._id,
    supplierId: po.supplierId,
    note,
    items: processedItems,
    totalQuantity,
    totalAmount,
    createdBy: userId,
  });

  return receiving;
};

/**
 * Tự động đồng bộ các Đơn Mua Hàng (PO) đã nhập kho trước đó sang Phiếu Nhập Kho (PNK)
 */
const syncFromPOs = async (userId) => {
  const Supplier = require('../models/supplier.model');
  const defaultSupplier = await Supplier.findOne();

  // Clean up PNKs that were erroneously created for unreceived / draft / in_transit POs
  const unreceivedPos = await PurchaseOrder.find({ status: { $in: ['draft', 'sent', 'in_transit', 'arrived', 'inspecting'] } }).distinct('_id');
  if (unreceivedPos.length > 0) {
    await StockReceiving.deleteMany({ purchaseOrderId: { $in: unreceivedPos } });
  }

  // ONLY sync POs that are COMPLETED or PARTIAL_RECEIVED (physical goods actually arrived)
  const pos = await PurchaseOrder.find({ status: { $in: ['completed', 'partial_received'] } });
  let createdCount = 0;

  for (const po of pos) {
    try {
      const existing = await StockReceiving.findOne({ purchaseOrderId: po._id });
      if (!existing) {
        const receivingNumber = await generateReceivingNumber();

        let totalQuantity = 0;
        let totalAmount = 0;

        const processedItems = (po.items || []).map((item) => {
          const qty = item.actualQty || item.expectedQty || 1;
          const price = item.importPrice || 0;
          const sub = qty * price;

          totalQuantity += qty;
          totalAmount += sub;

          item.receivedQty = qty;

          return {
            productId: item.productId,
            variantId: item.variantId || null,
            sku: item.sku || '',
            productName: item.productName || 'Sản phẩm',
            unit: item.unit || 'Cái',
            location: 'Kho Tổng - Kệ A1',
            expectedQty: item.expectedQty || qty,
            receivedQty: qty,
            importPrice: price,
            subtotal: sub,
          };
        });

        if (processedItems.length === 0) continue;

        await po.save();

        const suppId = po.supplierId || defaultSupplier?._id;
        if (!suppId) continue;

        await StockReceiving.create({
          receivingNumber,
          purchaseOrderId: po._id,
          supplierId: suppId,
          note: `Phiếu nhập kho đồng bộ tự động từ đơn mua hàng ${po.poNumber}`,
          receivedDate: po.updatedAt || po.createdAt || new Date(),
          items: processedItems,
          totalQuantity,
          totalAmount,
          createdBy: userId || po.createdById,
        });

        createdCount++;
      }
    } catch (err) {
      console.error(`[Sync-PNK-Error] Failed for PO ${po.poNumber}:`, err.message);
    }
  }

  return createdCount;
};

/**
 * Danh sách Phiếu Nhập Kho PNK
 */
const getAllStockReceivings = async (query = {}) => {
  const { page = 1, limit = 10, keyword } = query;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (keyword) {
    const regex = new RegExp(keyword.trim(), 'i');
    filter.$or = [{ receivingNumber: regex }, { note: regex }];
  }

  // Always sync missing active POs into PNK
  if (!keyword) {
    await syncFromPOs();
  }

  const total = await StockReceiving.countDocuments(filter);

  const data = await StockReceiving.find(filter)
    .populate('purchaseOrderId', 'poNumber deliveryDate status')
    .populate('supplierId', 'name code phone')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Chi tiết Phiếu Nhập Kho PNK
 */
const getStockReceivingById = async (id) => {
  const receiving = await StockReceiving.findById(id)
    .populate('purchaseOrderId')
    .populate('supplierId')
    .populate('createdBy', 'name email');

  if (!receiving) {
    throw new Error('Phieu nhap kho khong ton tai');
  }
  return receiving;
};

// Sinh Excel Phieu Nhap Kho dua tren template phieu nhap kho.xlsx
// Cau truc template xac nhan qua inspect-template.js:
//   A1(merged): Don vi / Bo phan
//   A4(merged): PHIEU NHAP KHO title
//   A5(merged): Ngay.... thang..... nam.... <- dien ngay lap phieu
//   H6: So: ......  <- so phieu PNK
//   A9(merged): Ho va ten nguoi giao
//   A10(merged): Theo ... so ...
//   A11(merged): Nhap tai kho
//   R12-R14: Table header
//   R15-R17: 3 data rows mau (TEMPLATE_DATA_ROWS = 3)
//   R18: Cong row
//   G22(merged): Ngay... thang... nam... (dong chu ky, KHONG phai ngay phieu)
const generateExcelSlip = async (id) => {
  const receiving = await getStockReceivingById(id);

  const templatePath = path.join(__dirname, '../template/phieu nhap kho.xlsx');
  if (!fs.existsSync(templatePath)) {
    throw new Error('Khong tim thay file mau phieu nhap kho.xlsx');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const sheet = workbook.worksheets[0];

  const d = new Date(receiving.createdAt);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  const supplierName = receiving.supplierId?.name
    || receiving.purchaseOrderId?.supplierId?.name
    || 'Nha cung cap';
  const poNumber = receiving.purchaseOrderId?.poNumber || '';

  // === BUOC 1: Dien cac o header bang dia chi chinh xac (tieng Viet co dau) ===
  sheet.getCell('A1').value = `Đơn vị: CÔNG TY ĐIỆN MÁY EGA\nBộ phận: Kho Thành Phẩm`;
  sheet.getCell('A5').value = `Ngày ${dd} tháng ${mm} năm ${yyyy}`;
  sheet.getCell('H6').value = `Số: ${receiving.receivingNumber}`;
  sheet.getCell('A9').value = `- Họ và tên người giao: ${supplierName}`;
  sheet.getCell('A10').value = poNumber
    ? `- Theo Đơn Mua Hàng số ${poNumber} ngày ${dd}/${mm}/${yyyy}`
    : `- Theo yêu cầu nhập kho ngày ${dd}/${mm}/${yyyy}`;
  sheet.getCell('A11').value = `Nhập tại kho: Kho Thành Phẩm EGA     Địa điểm: TP. Hồ Chí Minh`;

  // === BUOC 1b: Set column widths ===
  sheet.getColumn(1).width = 6;
  sheet.getColumn(2).width = 52;  // Ten san pham - rong hon de hien thi du
  sheet.getColumn(3).width = 16;
  sheet.getColumn(4).width = 10;
  sheet.getColumn(5).width = 13;
  sheet.getColumn(6).width = 13;
  sheet.getColumn(7).width = 17;
  sheet.getColumn(8).width = 18;

  // === BUOC 2: Xu ly data rows linh hoat ===
  const DATA_START_ROW = 15;
  const TEMPLATE_DATA_ROWS = 3; // R15, R16, R17
  const itemCount = receiving.items.length;

  const CELL_BORDER = {
    top:    { style: 'thin' },
    bottom: { style: 'thin' },
    left:   { style: 'thin' },
    right:  { style: 'thin' },
  };

  // Xoa data rows mau de tranh leak so
  for (let r = DATA_START_ROW; r < DATA_START_ROW + TEMPLATE_DATA_ROWS; r++) {
    const row = sheet.getRow(r);
    row.eachCell({ includeEmpty: true }, (cell) => { cell.value = null; });
    row.commit();
  }

  // Neu items nhieu hon 3, splice them rows vao truoc Cong row (sau row 17)
  if (itemCount > TEMPLATE_DATA_ROWS) {
    const extraCount = itemCount - TEMPLATE_DATA_ROWS;
    sheet.spliceRows(DATA_START_ROW + TEMPLATE_DATA_ROWS, 0, ...Array(extraCount).fill([]));
  }

  // === BUOC 3: Dien du lieu san pham + ap border + format so ===
  // Format so: ngan cach hang nghin, tranh hien thi scientific notation (1E+07)
  const NUM_FMT = '#,##0';

  receiving.items.forEach((item, index) => {
    const currentRow = sheet.getRow(DATA_START_ROW + index);
    const subtotal = (item.actualQty || 0) * (item.importPrice || 0);

    currentRow.getCell(1).value = index + 1;
    currentRow.getCell(2).value = item.productName || '';
    currentRow.getCell(3).value = item.sku || '';
    currentRow.getCell(4).value = item.unit || 'Cái';
    currentRow.getCell(5).value = item.expectedQty || 0;
    currentRow.getCell(6).value = item.actualQty || 0;
    currentRow.getCell(7).value = item.importPrice || 0;
    currentRow.getCell(8).value = subtotal;

    // Format so cho cot gia tien (tranh 1E+07)
    currentRow.getCell(7).numFmt = NUM_FMT;
    currentRow.getCell(8).numFmt = NUM_FMT;

    // Wrap text + can giua chieu doc cho ten san pham
    currentRow.getCell(2).alignment = { wrapText: true, vertical: 'middle' };

    // Chieu cao du de hien thi ten san pham dai
    currentRow.height = 40;

    // Ap border cho ca 8 cot
    for (let c = 1; c <= 8; c++) {
      currentRow.getCell(c).border = CELL_BORDER;
    }
    currentRow.commit();
  });

  // === BUOC 4: Cong row ===
  const congRowIdx = DATA_START_ROW + itemCount;
  const congRow = sheet.getRow(congRowIdx);
  congRow.getCell(2).value = 'Cộng';
  congRow.getCell(5).value = receiving.items.reduce((s, i) => s + (i.expectedQty || 0), 0);
  congRow.getCell(6).value = receiving.totalQuantity || 0;
  congRow.getCell(7).value = '';
  congRow.getCell(8).value = receiving.totalAmount || 0;
  congRow.getCell(8).numFmt = '#,##0';
  for (let c = 1; c <= 8; c++) {
    congRow.getCell(c).border = CELL_BORDER;
  }
  congRow.commit();

  return { workbook, receivingNumber: receiving.receivingNumber };
};

module.exports = {
  createStockReceiving,
  getAllStockReceivings,
  getStockReceivingById,
  syncFromPOs,
  generateExcelSlip,
};
