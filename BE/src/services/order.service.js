const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const ProductVariant = require('../models/productVariant.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const { AppError } = require('../utils/AppError');
const { getSellingPrice } = require('../utils/pricing.helper');
const couponService = require('./coupon.service');
const flashSaleService = require('./flashSale.service');

/**
 * Helper sinh mã đơn hàng độc nhất: ORD-YYYYMMDD-XXXX
 */
const generateOrderCode = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${rand}`;
};

/**
 * Runner thực thi Transaction an toàn với rollback
 */
const withTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * 1. TẠO ĐƠN HÀNG COD (CHECKOUT COD)
 * - BE re-check giá từ DB (Single Source of Truth)
 * - BE re-check tồn kho khả dụng (stock - allocated)
 * - BE re-check coupon & phân bổ discount
 * - Bọc trong MongoDB Transaction (ACID)
 */
const createOrderCOD = async (userId, orderData) => {
  if (!userId) {
    throw new AppError('Vui lòng đăng nhập tài khoản để tiến hành đặt hàng', 401);
  }

  const { addressId, shippingAddress: customAddress, couponCode, note = '', buyNowItem, items: directItems } = orderData;

  // 1. Xác định người dùng & Địa chỉ giao hàng
  const user = await User.findById(userId);
  if (!user) throw new AppError('Không tìm thấy tài khoản người dùng', 404);

  let finalShippingAddress = null;

  if (addressId) {
    const matchedAddr = user.addresses.id(addressId);
    if (!matchedAddr) throw new AppError('Địa chỉ giao hàng đã chọn không tồn tại', 404);
    finalShippingAddress = {
      fullName: matchedAddr.fullName,
      phone: matchedAddr.phone,
      province: matchedAddr.province,
      district: matchedAddr.district,
      ward: matchedAddr.ward,
      detailAddress: matchedAddr.detailAddress,
    };
  } else if (customAddress && customAddress.fullName && customAddress.phone && customAddress.detailAddress) {
    finalShippingAddress = customAddress;
  } else {
    // Lấy địa chỉ mặc định hoặc địa chỉ đầu tiên của user
    const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    if (!defaultAddr) {
      throw new AppError('Vui lòng cung cấp hoặc tạo địa chỉ giao hàng trước khi đặt hàng', 400);
    }
    finalShippingAddress = {
      fullName: defaultAddr.fullName,
      phone: defaultAddr.phone,
      province: defaultAddr.province,
      district: defaultAddr.district,
      ward: defaultAddr.ward,
      detailAddress: defaultAddr.detailAddress,
    };
  }

  // 2. Xác định danh sách mặt hàng: Hỗ trợ cả "Mua Ngay" (Buy Now) lẫn "Đặt từ Giỏ hàng"
  const isBuyNow = Boolean(buyNowItem || (Array.isArray(directItems) && directItems.length > 0));
  let rawItems = [];
  let userCart = null;

  if (isBuyNow) {
    if (buyNowItem) {
      if (!buyNowItem.variantId) {
        throw new AppError('Thiếu thông tin biến thể sản phẩm (variantId) khi mua ngay', 400);
      }
      rawItems = [{ variantId: buyNowItem.variantId, quantity: Number(buyNowItem.quantity) || 1 }];
    } else {
      rawItems = directItems;
    }
  } else {
    // Lấy từ giỏ hàng của User
    userCart = await Cart.findOne({ userId });
    if (!userCart || !userCart.items || userCart.items.length === 0) {
      throw new AppError('Giỏ hàng của bạn đang trống, không thể đặt hàng', 400);
    }
    rawItems = userCart.items;
  }

  // 3. Chuẩn bị Flash Sale Map
  const activeFlashSale = await flashSaleService.getActiveFlashSale();
  const flashSaleMap = new Map();
  if (activeFlashSale && Array.isArray(activeFlashSale.items)) {
    for (const fsItem of activeFlashSale.items) {
      const pId = fsItem.productId?._id ? fsItem.productId._id.toString() : fsItem.productId?.toString();
      const vId = fsItem.variantId?._id ? fsItem.variantId._id.toString() : fsItem.variantId?.toString();
      const key = vId ? `${pId}_${vId}` : `${pId}_default`;
      flashSaleMap.set(key, fsItem);
    }
  }

  // 4. Re-check giá và tồn kho từng item từ Database
  const orderItemsData = [];
  let totalSubtotal = 0;

  for (const item of rawItems) {
    const variant = await ProductVariant.findById(item.variantId).populate('productId');
    if (!variant || !variant.productId) {
      throw new AppError('Một hoặc nhiều sản phẩm trong giỏ hàng không còn tồn tại trên hệ thống', 400);
    }

    const product = variant.productId;
    if (product.isActive === false || variant.isActive === false) {
      throw new AppError(`Sản phẩm "${product.name}" hiện đang tạm ngừng kinh doanh`, 400);
    }

    const qty = Number(item.quantity) || 1;
    const availableStock = Math.max(0, (variant.stock || 0) - (variant.allocated || 0));

    if (availableStock < qty) {
      throw new AppError(
        `Sản phẩm "${product.name} (${variant.displayName || variant.sku})" chỉ còn ${availableStock} cái trong kho, không đủ số lượng ${qty} cái để đặt hàng`,
        400
      );
    }

    // Giá niêm yết gốc
    const originalPrice = Number(variant.price) || 0;
    // Giá bán thực tế cơ sở
    let unitPrice = getSellingPrice(variant);

    // Kiểm tra ưu đãi Flash Sale
    const fsKey = `${product._id.toString()}_${variant._id.toString()}`;
    const fsKeyProduct = `${product._id.toString()}_default`;
    const matchedFs = flashSaleMap.get(fsKey) || flashSaleMap.get(fsKeyProduct);

    if (matchedFs) {
      const fsPrice = matchedFs.flashSalePrice ?? matchedFs.flashPrice;
      const fsStock = Math.max(0, (matchedFs.stockLimit || 0) - (matchedFs.soldCount || 0));
      if (fsPrice !== null && fsPrice < unitPrice && fsStock >= qty) {
        unitPrice = fsPrice;
      }
    }

    const itemSubtotal = unitPrice * qty;
    totalSubtotal += itemSubtotal;

    orderItemsData.push({
      productId: product._id,
      variantId: variant._id,
      productName: product.name,
      variantName: variant.displayName || '',
      sku: variant.sku || '',
      thumbnail: variant.thumbnail?.url || product.thumbnail?.url || '',
      attributes: variant.attributes || [],
      originalPrice,
      salePrice: variant.salePrice ?? null,
      unitPrice,
      quantity: qty,
      subtotal: itemSubtotal,
      couponDiscountAllocated: 0,
      lineTotal: itemSubtotal,
    });
  }

  // 5. Re-check Coupon từ Database (Cấm tin số tiền giảm từ FE)
  let appliedCouponCode = null;
  let totalCouponDiscount = 0;
  let couponDoc = null;

  const codeToValidate = couponCode || cart.couponCode;
  if (codeToValidate && codeToValidate.trim()) {
    const couponRes = await couponService.validateCoupon(codeToValidate.trim(), totalSubtotal);
    totalCouponDiscount = couponRes.discountAmount || 0;
    appliedCouponCode = couponRes.coupon.code;
    couponDoc = couponRes.coupon;
  }

  // 6. Phân bổ Coupon Discount (Prorated Allocation) cho từng Line Item
  if (totalCouponDiscount > 0 && totalSubtotal > 0) {
    let allocatedSum = 0;
    for (let i = 0; i < orderItemsData.length; i++) {
      const it = orderItemsData[i];
      if (i === orderItemsData.length - 1) {
        // Món cuối cùng nhận phần còn lại để tránh chênh lệch do làm tròn
        it.couponDiscountAllocated = Math.max(0, totalCouponDiscount - allocatedSum);
      } else {
        const itemShare = Math.round((it.subtotal / totalSubtotal) * totalCouponDiscount);
        it.couponDiscountAllocated = itemShare;
        allocatedSum += itemShare;
      }
      it.lineTotal = Math.max(0, it.subtotal - it.couponDiscountAllocated);
    }
  }

  const shippingFee = 0; // Đơn COD nội bộ tạm tính 0đ phí ship (hoặc mở rộng theo vùng)
  const finalTotalAmount = Math.max(0, totalSubtotal - totalCouponDiscount + shippingFee);
  const orderCode = generateOrderCode();

  // 7. THỰC THI TRANSACTION MONGODB (ACID)
  const createdOrder = await withTransaction(async (session) => {
    // 7.1. Atomic check & Giữ chỗ kho hàng: allocated += qty
    for (const it of orderItemsData) {
      const updatedVariant = await ProductVariant.findOneAndUpdate(
        {
          _id: it.variantId,
          $expr: {
            $gte: [{ $subtract: ['$stock', '$allocated'] }, it.quantity],
          },
        },
        {
          $inc: { allocated: it.quantity },
        },
        { session, new: true }
      );

      if (!updatedVariant) {
        throw new AppError(
          `Sản phẩm "${it.productName}" vừa hết hàng hoặc không đủ tồn kho để giữ chỗ. Vui lòng kiểm tra lại giỏ hàng`,
          400
        );
      }
    }

    // 7.2. Tăng số lượt dùng của Coupon
    if (couponDoc) {
      await couponService.applyCoupon(couponDoc._id, totalSubtotal, session);
    }

    // 7.3. Tạo bản ghi Đơn hàng (Snapshot đóng băng bất biến)
    const [order] = await Order.create(
      [
        {
          orderCode,
          userId,
          items: orderItemsData,
          shippingAddress: finalShippingAddress,
          paymentMethod: 'COD',
          paymentStatus: 'UNPAID',
          orderStatus: 'PENDING',
          pricing: {
            subtotal: totalSubtotal,
            shippingFee,
            couponCode: appliedCouponCode,
            couponDiscount: totalCouponDiscount,
            totalAmount: finalTotalAmount,
          },
          note,
          statusHistory: [
            {
              status: 'PENDING',
              note: isBuyNow
                ? 'Đơn hàng Mua Ngay (COD) được tạo thành công, hàng đã được giữ chỗ trong kho.'
                : 'Đơn hàng COD được tạo từ giỏ hàng, hàng đã được giữ chỗ trong kho.',
              changedAt: new Date(),
              changedBy: userId,
            },
          ],
        },
      ],
      { session }
    );

    // 7.4. Xóa sạch các mặt hàng đã đặt khỏi giỏ hàng (Chỉ khi đặt từ Giỏ hàng; Mua Ngay giữ nguyên giỏ)
    if (!isBuyNow && userCart) {
      await Cart.updateOne(
        { _id: userCart._id },
        {
          $set: { items: [], couponCode: null, lastValidatedAt: new Date() },
        },
        { session }
      );
    }

    return order;
  });

  return createdOrder;
};

/**
 * 2. KHÁCH / SHOP HỦY ĐƠN HÀNG (CANCEL ORDER)
 * - Chỉ hủy khi đơn đang ở PENDING hoặc CONFIRMED
 * - Nhả tồn kho giữ chỗ: allocated -= qty
 * - Hoàn lại lượt dùng Coupon
 */
const cancelOrder = async (orderId, userId, reason = '') => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);

  // Kiểm tra quyền hủy (User sở hữu hoặc Admin)
  if (userId && order.userId && order.userId.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền hủy đơn hàng này', 403);
  }

  if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
    throw new AppError(
      `Không thể hủy đơn hàng đang ở trạng thái "${order.orderStatus}". Chỉ được hủy khi đơn đang chờ lấy hàng`,
      400
    );
  }

  const cancelledOrder = await withTransaction(async (session) => {
    // 1. Nhả giữ chỗ trong kho
    for (const it of order.items) {
      await ProductVariant.updateOne(
        { _id: it.variantId },
        { $inc: { allocated: -it.quantity } },
        { session }
      );
    }

    // 2. Hoàn lại lượt dùng Coupon (nếu có)
    if (order.pricing.couponCode) {
      await couponService.releaseCoupon(order.pricing.couponCode, session);
    }

    // 3. Cập nhật trạng thái đơn
    order.orderStatus = 'CANCELLED';
    order.cancelReason = reason || 'Khách hàng / Cửa hàng yêu cầu hủy đơn';
    order.cancelledAt = new Date();
    order.cancelledBy = userId || null;
    order.statusHistory.push({
      status: 'CANCELLED',
      note: `Hủy đơn thành công: ${order.cancelReason}. Tồn kho giữ chỗ đã được hoàn lại.`,
      changedAt: new Date(),
      changedBy: userId || null,
    });

    await order.save({ session });
    return order;
  });

  return cancelledOrder;
};

/**
 * 3. ADMIN CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (STATE MACHINE ĐIỀU PHỐI KHO NỘI BỘ - CÁCH A)
 * - CONFIRMED -> SHIPPING: Hàng rời kho -> stock -= qty, allocated -= qty
 * - SHIPPING -> DELIVERED: Thu tiền COD -> paymentStatus: PAID, sold += qty
 * - SHIPPING -> RETURNED: Khách bom/hàng về kho -> stock += qty
 * - DELIVERED -> RETURNED: Trả hàng sau giao -> stock += qty, sold -= qty
 */
const updateOrderStatus = async (orderId, { newStatus, note = '', adminUser = null }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);

  const currentStatus = order.orderStatus;
  if (currentStatus === newStatus) {
    return order;
  }

  // Định nghĩa các bước chuyển trạng thái hợp lệ
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPING', 'CANCELLED'],
    SHIPPING: ['DELIVERED', 'RETURNED'],
    DELIVERED: ['RETURNED'],
    CANCELLED: [],
    RETURNED: [],
  };

  const allowedNext = validTransitions[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Không thể chuyển trạng thái đơn hàng từ "${currentStatus}" sang "${newStatus}". Các trạng thái hợp lệ tiếp theo: [${allowedNext.join(', ')}]`,
      400
    );
  }

  const updatedOrder = await withTransaction(async (session) => {
    // 1. Chuyển sang SHIPPING (Đóng gói xuất kho giao đi)
    if (newStatus === 'SHIPPING' && ['PENDING', 'CONFIRMED'].includes(currentStatus)) {
      for (const it of order.items) {
        // Hàng chính thức rời kệ kho: trừ stock vật lý và trừ số lượng giữ chỗ
        await ProductVariant.updateOne(
          { _id: it.variantId },
          { $inc: { stock: -it.quantity, allocated: -it.quantity } },
          { session }
        );
      }
    }

    // 2. Chuyển sang DELIVERED (Giao thành công, thu tiền COD)
    if (newStatus === 'DELIVERED') {
      order.paymentStatus = 'PAID';
      for (const it of order.items) {
        // Ghi nhận doanh số đã bán
        await ProductVariant.updateOne(
          { _id: it.variantId },
          { $inc: { sold: it.quantity } },
          { session }
        );
      }
    }

    // 3. Chuyển sang RETURNED (Admin xác nhận hàng bom/trả đã về lại kệ kho)
    if (newStatus === 'RETURNED') {
      if (currentStatus === 'SHIPPING') {
        // Hàng giao không thành công, hoàn lại kệ kho vật lý
        for (const it of order.items) {
          await ProductVariant.updateOne(
            { _id: it.variantId },
            { $inc: { stock: it.quantity } },
            { session }
          );
        }
      } else if (currentStatus === 'DELIVERED') {
        // Đã giao rồi mới trả hàng: hoàn lại stock và trừ sold
        for (const it of order.items) {
          await ProductVariant.updateOne(
            { _id: it.variantId },
            { $inc: { stock: it.quantity, sold: -it.quantity } },
            { session }
          );
        }
      }
    }

    // 4. Chuyển sang CANCELLED (từ PENDING hoặc CONFIRMED)
    if (newStatus === 'CANCELLED' && ['PENDING', 'CONFIRMED'].includes(currentStatus)) {
      for (const it of order.items) {
        await ProductVariant.updateOne(
          { _id: it.variantId },
          { $inc: { allocated: -it.quantity } },
          { session }
        );
      }
      if (order.pricing.couponCode) {
        await couponService.releaseCoupon(order.pricing.couponCode, session);
      }
      order.cancelledAt = new Date();
      order.cancelledBy = adminUser?._id || null;
      order.cancelReason = note || 'Admin hủy đơn hàng';
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      note: note || `Chuyển trạng thái sang ${newStatus}`,
      changedAt: new Date(),
      changedBy: adminUser?._id || null,
    });

    await order.save({ session });
    return order;
  });

  return updatedOrder;
};

/**
 * 4. LẤY CHI TIẾT ĐƠN HÀNG (TRẢ VỀ SNAPSHOT ĐÓNG BĂNG, KHÔNG RE-QUERY GIÁ HIỆN TẠI)
 */
const getOrderById = async (orderId, userId = null) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);

  // Nếu user thường tra cứu thì phải đúng đơn của mình
  if (userId && order.userId && order.userId.toString() !== userId.toString()) {
    throw new AppError('Bạn không có quyền xem đơn hàng này', 403);
  }

  return order;
};

/**
 * 5. LẤY DANH SÁCH ĐƠN HÀNG CỦA TÔI (MY ORDERS)
 */
const getMyOrders = async (userId, query = {}) => {
  const filter = { userId };
  if (query.status) {
    filter.orderStatus = query.status.toUpperCase();
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * 6. LẤY TẤT CẢ ĐƠN HÀNG (DÀNH CHO ADMIN)
 */
const getAllOrders = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.orderStatus = query.status.toUpperCase();
  }
  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus.toUpperCase();
  }
  if (query.search) {
    filter.$or = [
      { orderCode: { $regex: query.search.trim(), $options: 'i' } },
      { 'shippingAddress.phone': { $regex: query.search.trim(), $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: query.search.trim(), $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

module.exports = {
  createOrderCOD,
  cancelOrder,
  updateOrderStatus,
  getOrderById,
  getMyOrders,
  getAllOrders,
};
