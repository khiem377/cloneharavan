const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const ProductWarehouseStock = require('../models/productWarehouseStock.model');
const Order = require('../models/order.model');
const Shipment = require('../models/shipment.model');

/**
 * Service đối soát và đồng bộ toàn diện tồn kho (Stock Reconciliation Service)
 * 1. Tính toán chính xác số lượng giữ chỗ (allocated) từ các đơn hàng thực tế đang hoạt động
 * 2. Cập nhật ProductVariant.allocated và ProductWarehouseStock.allocated
 * 3. Đồng bộ Product.stock = sum(ProductVariant.stock) của sản phẩm cha
 */
const reconcileAndSyncStock = async () => {
  console.log('[StockSync] Bắt đầu rà soát và đồng bộ toàn bộ tồn kho hệ thống...');

  // 1. Xác định các đơn hàng đã xuất kho / tạo vận đơn
  const shippedOrders = await Shipment.find().select('orderId').lean();
  const shippedOrderIds = new Set(shippedOrders.map((s) => String(s.orderId)));

  // 2. Lấy các đơn hàng đang hoạt động cần giữ chỗ thực tế
  const activeOrders = await Order.find({
    orderStatus: { $in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
  }).lean();

  const realAllocatedMap = new Map();
  for (const order of activeOrders) {
    if (shippedOrderIds.has(String(order._id))) continue;
    for (const it of order.items || []) {
      if (!it.variantId) continue;
      const vid = String(it.variantId);
      realAllocatedMap.set(vid, (realAllocatedMap.get(vid) || 0) + (Number(it.quantity) || 0));
    }
  }

  // 3. Đồng bộ ProductVariant (stock >= 0, allocated = realAllocated)
  const allVariants = await ProductVariant.find();
  const variantMap = new Map();

  for (const v of allVariants) {
    const vid = String(v._id);
    const correctAllocated = realAllocatedMap.get(vid) || 0;
    let modified = false;

    if (v.allocated !== correctAllocated) {
      v.allocated = correctAllocated;
      modified = true;
    }
    if (v.stock < 0) {
      v.stock = 0;
      modified = true;
    }

    if (modified) {
      await v.save();
    }
    variantMap.set(vid, v);
  }

  // 4. Đồng bộ ProductWarehouseStock (allocated >= 0, stock >= 0)
  const allPwStocks = await ProductWarehouseStock.find();
  for (const pws of allPwStocks) {
    let modified = false;
    if (pws.allocated < 0) {
      pws.allocated = 0;
      modified = true;
    }
    if (pws.stock < 0) {
      pws.stock = 0;
      modified = true;
    }
    if (modified) {
      await pws.save();
    }
  }

  // 5. Đồng bộ Product cha: stock = tổng stock của các biến thể, allocated = tổng allocated
  const allProducts = await Product.find();
  let updatedProductCount = 0;

  for (const p of allProducts) {
    const pid = String(p._id);
    const pVariants = allVariants.filter((v) => String(v.productId) === pid);

    if (pVariants.length > 0) {
      const totalStock = pVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      const totalAllocated = pVariants.reduce((sum, v) => sum + (Number(v.allocated) || 0), 0);

      if (p.stock !== totalStock || p.allocated !== totalAllocated) {
        p.stock = totalStock;
        p.allocated = totalAllocated;
        await p.save();
        updatedProductCount++;
      }
    }
  }

  console.log(`[StockSync] Đồng bộ hoàn tất! Đã cập nhật ${updatedProductCount} sản phẩm cha.`);
  return {
    success: true,
    totalVariants: allVariants.length,
    updatedProductCount,
  };
};

module.exports = {
  reconcileAndSyncStock,
};
