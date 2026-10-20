const mongoose = require('mongoose');

// Cache sample data trong RAM để không query DB liên tục mỗi lần debounce preview
let cachedSampleData = null;
let lastCachedTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 phút

/**
 * Lấy dữ liệu đơn hàng mẫu thực tế từ Database (1 Sản phẩm thật + 1 Combo thật)
 */
const getRealSampleOrderData = async () => {
  const now = Date.now();
  if (cachedSampleData && now - lastCachedTime < CACHE_TTL_MS) {
    return cachedSampleData;
  }

  try {
    const Product = require('../../models/product.model');
    const Combo = require('../../models/combo.model');

    // 1. Lấy sản phẩm thật từ DB
    const realProducts = await Product.find({ status: 'active' })
      .select('name sku price images thumbnail variants')
      .limit(3)
      .lean();

    let productItem = null;
    if (realProducts && realProducts.length > 0) {
      const p = realProducts[0];
      const pImg = p.images?.[0]?.url || p.images?.[0] || p.thumbnail?.url || p.thumbnail;
      const pVariant = p.variants?.[0];
      const pPrice = Number(pVariant?.price || p.price) || 890000;

      productItem = {
        productName: p.name || 'Tai nghe Bluetooth không dây Pro 2',
        variantName: pVariant?.name || 'Màu Trắng / Bản Tiêu Chuẩn',
        sku: pVariant?.sku || p.sku || 'SKU-PRO-01',
        quantity: 1,
        unitPrice: pPrice,
        subtotal: pPrice,
        image: pImg || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80',
      };
    } else {
      productItem = {
        productName: 'Tai nghe Bluetooth chống ồn Pro ANC',
        variantName: 'Màu Đen Nhám / Bluetooth 5.3',
        sku: 'SKU-EAR-ANC',
        quantity: 1,
        unitPrice: 890000,
        subtotal: 890000,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80',
      };
    }

    // 2. Lấy Combo thật từ DB
    const realCombo = await Combo.findOne({ isActive: true })
      .populate('items.productId', 'name images')
      .lean();

    let comboItem = null;
    if (realCombo) {
      const cImg = realCombo.items?.[0]?.productId?.images?.[0]?.url
        || realCombo.items?.[0]?.productId?.images?.[0]
        || 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80';
      const cPrice = Number(realCombo.comboPrice) || 450000;

      comboItem = {
        productName: `[Combo Tiết Kiệm] ${realCombo.name}`,
        variantName: 'Bộ quà tặng ưu đãi đặc biệt',
        sku: realCombo.code || 'COMBO-SAVER',
        quantity: 1,
        unitPrice: cPrice,
        subtotal: cPrice,
        image: cImg,
      };
    } else if (realProducts && realProducts.length > 1) {
      // Nếu chưa có combo trong DB, lấy sản phẩm thứ 2 tạo thành combo
      const p2 = realProducts[1];
      const p2Img = p2.images?.[0]?.url || p2.images?.[0] || 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80';
      const p2Price = Number(p2.price) || 350000;

      comboItem = {
        productName: `[Combo Ưu Đãi] ${p2.name} + Cáp sạc cao cấp`,
        variantName: 'Bộ sản phẩm kèm phụ kiện',
        sku: p2.sku ? `COMBO-${p2.sku}` : 'COMBO-SPECIAL',
        quantity: 1,
        unitPrice: p2Price,
        subtotal: p2Price,
        image: p2Img,
      };
    } else {
      comboItem = {
        productName: '[Combo Tiết Kiệm] Củ sạc nhanh 30W GaN + Cáp Type-C dù chống đứt',
        variantName: 'Bảo hành 12 tháng chính hãng',
        sku: 'COMBO-FAST-30W',
        quantity: 1,
        unitPrice: 350000,
        subtotal: 350000,
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
      };
    }

    const items = [productItem, comboItem];
    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const shippingFee = 30000;
    const discount = 50000; // Khuyến mãi giảm giá
    const totalAmount = subtotal + shippingFee - discount;

    cachedSampleData = {
      orderCode: '6711',
      orderDate: new Date().toLocaleDateString('vi-VN'),
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@gmail.com',
      customerPhone: '0912 345 678',
      shippingAddress: '412 Đội Cấn, Phường Liễu Giai, Quận Ba Đình, Hà Nội',
      paymentMethod: 'Ví điện tử MoMo (Đã thanh toán thành công)',
      shippingMethod: 'Giao hàng nhanh (GHN Express)',
      items,
      pricing: {
        subtotal,
        shippingFee,
        discount,
        totalAmount,
      },
    };
    lastCachedTime = now;
    return cachedSampleData;
  } catch (err) {
    console.warn('Lỗi khi nạp sample order data từ DB:', err.message);
    return {
      orderCode: '6711',
      orderDate: new Date().toLocaleDateString('vi-VN'),
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nguyenvana@gmail.com',
      customerPhone: '0912 345 678',
      shippingAddress: '412 Đội Cấn, Phường Liễu Giai, Quận Ba Đình, Hà Nội',
      paymentMethod: 'Ví điện tử MoMo (Đã thanh toán thành công)',
      shippingMethod: 'Giao hàng nhanh (GHN Express)',
      items: [
        {
          productName: 'Tai nghe Bluetooth không dây Pro 2',
          variantName: 'Màu Trắng / Bản Tiêu Chuẩn',
          sku: 'SKU-PRO-01',
          quantity: 1,
          unitPrice: 890000,
          subtotal: 890000,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80',
        },
        {
          productName: '[Combo Tiết Kiệm] Củ sạc nhanh 30W + Cáp sạc dù siêu bền',
          variantName: 'Bảo hành 12 tháng chính hãng',
          sku: 'COMBO-FAST-30W',
          quantity: 1,
          unitPrice: 350000,
          subtotal: 350000,
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&auto=format&fit=crop&q=80',
        },
      ],
      pricing: {
        subtotal: 1240000,
        shippingFee: 30000,
        discount: 50000,
        totalAmount: 1220000,
      },
    };
  }
};

module.exports = {
  getRealSampleOrderData,
};
