const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const ProductWarehouseStock = require('../models/productWarehouseStock.model');
const AppError = require('../utils/AppError');

class StockAlertService {
  static async getLowStockItems({ threshold = 5, page = 1, limit = 10, search = '', viewMode = 'all', warehouseId = '' }) {
    const minQty = Number(threshold);

    const query = {};
    if (viewMode === 'low_stock') {
      query.stock = { $lte: minQty };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const parentProductIds = await Product.find({
        $or: [{ name: searchRegex }, { productCode: searchRegex }],
      }).distinct('_id');

      query.$or = [
        { sku: searchRegex },
        { displayName: searchRegex },
        { productId: { $in: parentProductIds } },
      ];
    }

    const skip = (page - 1) * limit;

    const PurchaseOrder = require('../models/purchaseOrder.model');
    const StockExport = require('../models/stockExport.model');

    const [
      variants,
      totalMatchedVariants,
      allProductsCount,
      totalVariantsCount,
      outOfStockCount,
      lowStockCount,
      poDraftCount,
      poPendingCount,
      poPartialCount,
      poCompletedCount,
      exPendingCount,
      exPickingCount,
      exPackedCount,
      exCompletedCount,
    ] = await Promise.all([
      ProductVariant.find(query)
        .populate({
          path: 'productId',
          select: 'name productCode thumbnail brand supplierId price costPrice',
          populate: [
            { path: 'brand', select: 'name' },
            { path: 'supplierId', select: 'name code' },
          ],
        })
        .populate('supplierId', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ProductVariant.countDocuments(query),
      Product.countDocuments(),
      ProductVariant.countDocuments(),
      ProductVariant.countDocuments({ stock: 0 }),
      ProductVariant.countDocuments({ stock: { $gt: 0, $lte: minQty } }),
      PurchaseOrder.countDocuments({ status: 'draft' }),
      PurchaseOrder.countDocuments({ status: { $in: ['sent', 'in_transit'] } }),
      PurchaseOrder.countDocuments({ status: 'partial_received' }),
      PurchaseOrder.countDocuments({ status: 'completed' }),
      StockExport.countDocuments({ status: 'pending_pick' }),
      StockExport.countDocuments({ status: 'picking' }),
      StockExport.countDocuments({ status: 'packed' }),
      StockExport.countDocuments({ status: 'completed' }),
    ]);

    // Lấy chi tiết phân bổ tồn kho theo từng kho hàng
    const variantIds = variants.map((v) => v._id);
    const pwStocks = await ProductWarehouseStock.find({ variantId: { $in: variantIds } })
      .populate('warehouseId', 'name code isDefault');

    const pwMap = new Map();
    pwStocks.forEach((pws) => {
      const vid = pws.variantId.toString();
      if (!pwMap.has(vid)) pwMap.set(vid, []);
      pwMap.get(vid).push({
        warehouseId: pws.warehouseId?._id,
        warehouseName: pws.warehouseId?.name || 'Kho',
        warehouseCode: pws.warehouseId?.code || '',
        stock: pws.stock || 0,
        allocated: pws.allocated || 0,
        available: Math.max(0, (pws.stock || 0) - (pws.allocated || 0)),
        isDefault: pws.warehouseId?.isDefault || false,
      });
    });

    const formattedList = variants.map((v) => {
      const parent = v.productId || {};
      const itemWarehouseList = pwMap.get(v._id.toString()) || [];

      let stock = v.stock || 0;
      let allocated = v.allocated || 0;

      if (warehouseId) {
        const targetWhStock = itemWarehouseList.find(
          (wh) => wh.warehouseId && wh.warehouseId.toString() === warehouseId.toString()
        );
        stock = targetWhStock?.stock || 0;
        allocated = targetWhStock?.allocated || 0;
      }

      const available = Math.max(0, stock - allocated);
      const isOutOfStock = stock === 0;
      const isLowStock = stock > 0 && stock <= minQty;
      const reorderQty = Math.max(20, minQty * 4 - stock);

      const supplierObj = v.supplierId || parent.supplierId || {};

      return {
        id: v._id,
        productId: parent._id || v.productId,
        name: parent.name ? `${parent.name} ${v.isDefault ? '' : `(${v.displayName || ''})`}` : (v.displayName || 'Sản phẩm'),
        variantName: v.displayName || 'Mặc định',
        productCode: v.sku || parent.productCode || 'SKU-001',
        brandName: parent.brand?.name || '---',
        supplierId: supplierObj._id || supplierObj || '',
        supplierName: supplierObj.name || '---',
        thumbnail: v.thumbnail?.url || parent.thumbnail?.url || '',
        price: v.price || parent.price || 0,
        costPrice: v.costPrice || parent.costPrice || 0,
        stock,
        allocated,
        available,
        minThreshold: minQty,
        suggestedReorderQty: reorderQty,
        alertLevel: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'SAFE',
        warehouseStocks: itemWarehouseList,
      };
    });

    return {
      items: formattedList,
      summary: {
        totalProducts: allProductsCount,
        totalVariants: totalVariantsCount,
        outOfStockCount,
        lowStockCount,
        safeStockCount: Math.max(0, totalVariantsCount - outOfStockCount - lowStockCount),
        threshold: minQty,
        poStats: {
          draft: poDraftCount,
          pending: poPendingCount,
          partial: poPartialCount,
          completed: poCompletedCount,
          totalActive: poDraftCount + poPendingCount + poPartialCount,
        },
        exStats: {
          pending_pick: exPendingCount,
          picking: exPickingCount,
          packed: exPackedCount,
          completed: exCompletedCount,
          totalActive: exPendingCount + exPickingCount + exPackedCount,
        },
      },
      pagination: {
        total: totalMatchedVariants,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalMatchedVariants / limit) || 1,
      },
    };
  }

  static async updateCostPrice(variantId, costPrice) {
    let variant = await ProductVariant.findById(variantId);
    if (variant) {
      variant.costPrice = Number(costPrice || 0);
      await variant.save();

      // Cập nhật đồng bộ sang parent Product nếu là Default Variant
      if (variant.isDefault && variant.productId) {
        await Product.findByIdAndUpdate(variant.productId, { costPrice: Number(costPrice || 0) });
      }
      return variant;
    }

    const product = await Product.findById(variantId);
    if (!product) throw new AppError('Sản phẩm / Biến thể không tồn tại', 404);
    product.costPrice = Number(costPrice || 0);
    await product.save();
    return product;
  }
}

module.exports = StockAlertService;
