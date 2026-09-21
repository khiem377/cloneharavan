const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const PurchaseReturn = require('../models/purchaseReturn.model');
const Supplier = require('../models/supplier.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const StockMovement = require('../models/stockMovement.model');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

class PurchaseReturnService {
  static async getPurchaseReturns({ page = 1, limit = 10, search = '', status = '', supplierId = '' }) {
    const query = {};
    if (search) {
      query.$or = [
        { returnNumber: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;

    const skip = (page - 1) * limit;
    const [returns, total] = await Promise.all([
      PurchaseReturn.find(query)
        .populate('supplierId', 'name code phone email')
        .populate('createdById', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      PurchaseReturn.countDocuments(query),
    ]);

    return {
      returns,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getPurchaseReturnById(id) {
    const pr = await PurchaseReturn.findById(id)
      .populate('supplierId', 'name code phone email address taxCode')
      .populate('createdById', 'name email');
    if (!pr) throw new AppError('Phiếu trả hàng nhập không tồn tại', 404);
    return pr;
  }

  static async createPurchaseReturn(payload, userId) {
    const { supplierId, poId, note, items } = payload;
    if (!items || items.length === 0) {
      throw new AppError('Danh sách sản phẩm xuất trả không được để trống', 400);
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 400);

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await PurchaseReturn.countDocuments();
    const returnNumber = `PR-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    let totalQuantity = 0;
    let totalAmount = 0;

    const formattedItems = items.map((item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.returnPrice || 0);
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
        returnPrice: price,
        subtotal: sub,
        reason: item.reason || 'Hàng lỗi / Hoàn trả nhà cung cấp',
      };
    });

    const purchaseReturn = await PurchaseReturn.create({
      returnNumber,
      poId: poId || null,
      supplierId: supplier._id,
      supplierName: supplier.name,
      items: formattedItems,
      totalQuantity,
      totalAmount,
      refundStatus: 'unpaid',
      refundAmount: 0,
      status: 'completed',
      note: note || '',
      createdById: userId,
    });

    // Trừ tồn kho sản phẩm/biến thể & Ghi log StockMovement
    for (const item of formattedItems) {
      if (item.variantId) {
        const variant = await ProductVariant.findById(item.variantId);
        if (variant) {
          const beforeStock = variant.stock || 0;
          variant.stock = Math.max(0, beforeStock - item.quantity);
          await variant.save();

          await StockMovement.create({
            type: 'RETURN',
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName,
            beforeStock,
            changeQty: -item.quantity,
            afterStock: variant.stock,
            referenceNumber: returnNumber,
            reason: `Xuất trả nhà cung cấp ${supplier.name} - Đơn ${returnNumber}`,
            createdById: userId,
          });
        }
      }

      const product = await Product.findById(item.productId);
      if (product) {
        const beforeStock = product.stock || 0;
        product.stock = Math.max(0, beforeStock - item.quantity);
        await product.save();

        if (!item.variantId) {
          await StockMovement.create({
            type: 'RETURN',
            productId: item.productId,
            sku: item.sku,
            productName: item.productName,
            beforeStock,
            changeQty: -item.quantity,
            afterStock: product.stock,
            referenceNumber: returnNumber,
            reason: `Xuất trả nhà cung cấp ${supplier.name} - Đơn ${returnNumber}`,
            createdById: userId,
          });
        }
      }
    }

    // Excel export & Cloudinary archive
    try {
      const { workbook } = await this.generateExcelSlip(purchaseReturn._id);
      const buffer = await workbook.xlsx.writeBuffer();
      const folderPath = `inventory_archives/purchase_returns`;
      const result = await uploadRawToCloudinary(buffer, folderPath);
      if (result?.secure_url) {
        purchaseReturn.documentUrl = result.secure_url;
        purchaseReturn.documentPublicId = result.public_id;
        await purchaseReturn.save();
      }
    } catch (err) {
      console.error(`[Archive-Error] Upload PR ${returnNumber} to Cloudinary failed:`, err.message);
    }

    return purchaseReturn;
  }

  static async updateRefundStatus(id, { refundStatus, refundAmount }) {
    const pr = await PurchaseReturn.findById(id);
    if (!pr) throw new AppError('Phiếu trả hàng không tồn tại', 404);

    if (refundStatus) pr.refundStatus = refundStatus;
    if (typeof refundAmount === 'number') pr.refundAmount = refundAmount;
    await pr.save();
    return pr;
  }

  static async generateExcelSlip(id) {
    const pr = await PurchaseReturn.findById(id).populate('supplierId');
    if (!pr) throw new AppError('Phiếu trả hàng không tồn tại', 404);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Phieu Tra Hang Nhap');

    sheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Tên Sản Phẩm', key: 'productName', width: 35 },
      { header: 'Mã SKU', key: 'sku', width: 18 },
      { header: 'Đơn Vị', key: 'unit', width: 10 },
      { header: 'Số Lượng', key: 'quantity', width: 12 },
      { header: 'Đơn Giá Xuất Trả', key: 'returnPrice', width: 18 },
      { header: 'Thành Tiền', key: 'subtotal', width: 20 },
      { header: 'Lý Do Xuất Trả', key: 'reason', width: 30 },
    ];

    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value = 'CÔNG TY ĐIỆN MÁY EGA';
    sheet.getCell('A1').font = { bold: true, size: 14 };

    sheet.mergeCells('A2:H2');
    sheet.getCell('A2').value = `PHIẾU TRẢ HÀNG NHẬP (MÃ: ${pr.returnNumber})`;
    sheet.getCell('A2').font = { bold: true, size: 16, color: { argb: 'FF1D4ED8' } };

    sheet.mergeCells('A3:H3');
    sheet.getCell('A3').value = `Nhà cung cấp: ${pr.supplierName} | Ngày tạo: ${new Date(pr.createdAt).toLocaleDateString('vi-VN')}`;

    sheet.addRow([]);
    sheet.addRow(['STT', 'Tên Sản Phẩm', 'Mã SKU', 'Đơn Vị', 'Số Lượng', 'Đơn Giá Xuất Trả', 'Thành Tiền', 'Lý Do Xuất Trả']);
    sheet.getRow(5).font = { bold: true };

    pr.items.forEach((item, index) => {
      sheet.addRow({
        stt: index + 1,
        productName: item.productName,
        sku: item.sku,
        unit: item.unit || 'Cái',
        quantity: item.quantity,
        returnPrice: item.returnPrice,
        subtotal: item.subtotal,
        reason: item.reason,
      });
    });

    const sumRow = sheet.addRow({
      stt: '',
      productName: 'TỔNG CỘNG',
      sku: '',
      unit: '',
      quantity: pr.totalQuantity,
      returnPrice: '',
      subtotal: pr.totalAmount,
      reason: '',
    });
    sumRow.font = { bold: true };

    return { workbook, returnNumber: pr.returnNumber };
  }
}

module.exports = PurchaseReturnService;
