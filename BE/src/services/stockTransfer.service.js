const StockTransfer = require('../models/stockTransfer.model');
const Warehouse = require('../models/warehouse.model');
const ProductWarehouseStock = require('../models/productWarehouseStock.model');
const ProductVariant = require('../models/productVariant.model');
const StockMovement = require('../models/stockMovement.model');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../middleware/sanitize.middleware');

class StockTransferService {
  static async getStockTransfers({ page = 1, limit = 20, status = '', keyword = '' }) {
    const filter = {};
    if (status) filter.status = status;
    if (keyword) {
      const safeKw = escapeRegex(keyword);
      filter.$or = [
        { transferNumber: { $regex: safeKw, $options: 'i' } },
        { note: { $regex: safeKw, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [transfers, total] = await Promise.all([
      StockTransfer.find(filter)
        .populate('fromWarehouseId', 'name code')
        .populate('toWarehouseId', 'name code')
        .populate('createdById', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockTransfer.countDocuments(filter),
    ]);

    return {
      data: transfers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getStockTransferById(id) {
    const transfer = await StockTransfer.findById(id)
      .populate('fromWarehouseId', 'name code phone address')
      .populate('toWarehouseId', 'name code phone address')
      .populate('createdById', 'name email');

    if (!transfer) throw new AppError('Phiếu chuyển kho không tồn tại', 404);
    return transfer;
  }

  static async createStockTransfer(payload, userId) {
    const { fromWarehouseId, toWarehouseId, note, items } = payload;

    if (!fromWarehouseId || !toWarehouseId) {
      throw new AppError('Kho xuất và kho nhận không được để trống', 400);
    }
    if (fromWarehouseId.toString() === toWarehouseId.toString()) {
      throw new AppError('Kho xuất và kho nhận không thể trùng nhau', 400);
    }
    if (!items || items.length === 0) {
      throw new AppError('Danh sách sản phẩm chuyển kho không được để trống', 400);
    }

    const [fromWh, toWh] = await Promise.all([
      Warehouse.findById(fromWarehouseId),
      Warehouse.findById(toWarehouseId),
    ]);
    if (!fromWh || !toWh) throw new AppError('Kho hàng không hợp lệ', 400);

    // Kiểm tra tồn kho khả dụng tại kho xuất
    for (const item of items) {
      const stockDoc = await ProductWarehouseStock.findOne({
        warehouseId: fromWarehouseId,
        variantId: item.variantId,
      });
      const available = stockDoc ? Math.max(0, (stockDoc.stock || 0) - (stockDoc.allocated || 0)) : 0;
      if (available < item.quantity) {
        throw new AppError(
          `Sản phẩm "${item.productName || item.sku}" chỉ còn khả dụng ${available} tại "${fromWh.name}", không đủ để chuyển ${item.quantity}`,
          400
        );
      }
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await StockTransfer.countDocuments();
    const transferNumber = `TRF-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const transfer = await StockTransfer.create({
      transferNumber,
      fromWarehouseId,
      toWarehouseId,
      status: 'pending_ship',
      items,
      totalQuantity,
      note: note || '',
      createdById: userId,
    });

    return transfer;
  }

  /**
   * Cập nhật trạng thái chuyển kho:
   * - 'in_transit': Xuất hàng khỏi kho nguồn (giảm stock tại fromWarehouseId, ghi StockMovement TRANSFER_OUT)
   * - 'completed': Nhập hàng vào kho đích (tăng stock tại toWarehouseId, ghi StockMovement TRANSFER_IN)
   * - 'cancelled': Hủy lệnh chuyển kho (nếu đã in_transit thì hoàn lại kho nguồn)
   */
  static async updateStatus(id, newStatus, userId) {
    const transfer = await StockTransfer.findById(id)
      .populate('fromWarehouseId', 'name code')
      .populate('toWarehouseId', 'name code');

    if (!transfer) throw new AppError('Phiếu chuyển kho không tồn tại', 404);
    if (transfer.status === 'completed' || transfer.status === 'cancelled') {
      throw new AppError(`Phiếu chuyển đã ở trạng thái [${transfer.status}], không thể thay đổi`, 400);
    }

    const oldStatus = transfer.status;

    // 1. Chuyển sang Đang vận chuyển: Trừ kho xuất
    if (newStatus === 'in_transit' && oldStatus === 'pending_ship') {
      for (const item of transfer.items) {
        const fromStock = await ProductWarehouseStock.findOne({
          warehouseId: transfer.fromWarehouseId._id,
          variantId: item.variantId,
        });
        const currentStock = fromStock ? fromStock.stock : 0;
        const newStock = Math.max(0, currentStock - item.quantity);

        await ProductWarehouseStock.updateOne(
          { warehouseId: transfer.fromWarehouseId._id, variantId: item.variantId },
          { $set: { stock: newStock } },
          { upsert: true }
        );

        await StockMovement.create({
          type: 'TRANSFER_OUT',
          warehouseId: transfer.fromWarehouseId._id,
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          productName: item.productName,
          beforeStock: currentStock,
          changeQty: -item.quantity,
          afterStock: newStock,
          referenceNumber: transfer.transferNumber,
          reason: `Xuất chuyển kho sang ${transfer.toWarehouseId.name}`,
          createdById: userId,
        });
      }
      transfer.shippedAt = new Date();
    }

    // 2. Chuyển sang Hoàn thành: Cộng kho đích
    if (newStatus === 'completed') {
      if (oldStatus === 'pending_ship') {
        // Nếu chuyển thẳng từ pending_ship -> completed, trừ kho xuất trước
        for (const item of transfer.items) {
          const fromStock = await ProductWarehouseStock.findOne({
            warehouseId: transfer.fromWarehouseId._id,
            variantId: item.variantId,
          });
          const currentStock = fromStock ? fromStock.stock : 0;
          const newStock = Math.max(0, currentStock - item.quantity);

          await ProductWarehouseStock.updateOne(
            { warehouseId: transfer.fromWarehouseId._id, variantId: item.variantId },
            { $set: { stock: newStock } },
            { upsert: true }
          );

          await StockMovement.create({
            type: 'TRANSFER_OUT',
            warehouseId: transfer.fromWarehouseId._id,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.sku,
            productName: item.productName,
            beforeStock: currentStock,
            changeQty: -item.quantity,
            afterStock: newStock,
            referenceNumber: transfer.transferNumber,
            reason: `Xuất chuyển kho sang ${transfer.toWarehouseId.name}`,
            createdById: userId,
          });
        }
      }

      // Cộng vào kho đích
      for (const item of transfer.items) {
        const toStock = await ProductWarehouseStock.findOne({
          warehouseId: transfer.toWarehouseId._id,
          variantId: item.variantId,
        });
        const currentStock = toStock ? toStock.stock : 0;
        const newStock = currentStock + item.quantity;

        await ProductWarehouseStock.updateOne(
          { warehouseId: transfer.toWarehouseId._id, variantId: item.variantId },
          { $set: { productId: item.productId, stock: newStock } },
          { upsert: true }
        );

        await StockMovement.create({
          type: 'TRANSFER_IN',
          warehouseId: transfer.toWarehouseId._id,
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          productName: item.productName,
          beforeStock: currentStock,
          changeQty: item.quantity,
          afterStock: newStock,
          referenceNumber: transfer.transferNumber,
          reason: `Nhập nhận chuyển kho từ ${transfer.fromWarehouseId.name}`,
          createdById: userId,
        });
      }
      transfer.receivedAt = new Date();
    }

    // 3. Huỷ: Nếu đang in_transit thì hoàn lại kho xuất
    if (newStatus === 'cancelled' && oldStatus === 'in_transit') {
      for (const item of transfer.items) {
        const fromStock = await ProductWarehouseStock.findOne({
          warehouseId: transfer.fromWarehouseId._id,
          variantId: item.variantId,
        });
        const currentStock = fromStock ? fromStock.stock : 0;
        const newStock = currentStock + item.quantity;

        await ProductWarehouseStock.updateOne(
          { warehouseId: transfer.fromWarehouseId._id, variantId: item.variantId },
          { $set: { stock: newStock } }
        );

        await StockMovement.create({
          type: 'ADJUSTMENT',
          warehouseId: transfer.fromWarehouseId._id,
          productId: item.productId,
          variantId: item.variantId,
          sku: item.sku,
          productName: item.productName,
          beforeStock: currentStock,
          changeQty: item.quantity,
          afterStock: newStock,
          referenceNumber: transfer.transferNumber,
          reason: `Hoàn tồn do huỷ lệnh chuyển kho ${transfer.transferNumber}`,
          createdById: userId,
        });
      }
    }

    transfer.status = newStatus;
    await transfer.save();

    return transfer;
  }
}

module.exports = StockTransferService;
