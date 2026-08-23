/**
 * Migration Script: Tạo Default Variant cho tất cả sản phẩm chưa có variant
 * - Idempotent: Chạy nhiều lần không sinh trùng lặp dữ liệu
 * - Điều kiện: Chỉ tạo khi ProductVariant.countDocuments({ productId }) === 0
 * - Gán isDefault: true
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Product = require('../src/models/product.model');
const ProductVariant = require('../src/models/productVariant.model');

const runMigration = async () => {
  console.log('🚀 Bắt đầu quá trình Migration Default Variants...');
  await connectDB();

  const products = await Product.find({});
  console.log(`📦 Tìm thấy tổng cộng ${products.length} sản phẩm trong database.\n`);

  let createdCount = 0;
  let skippedCount = 0;
  let errorCount   = 0;

  for (const product of products) {
    try {
      const existingVariantsCount = await ProductVariant.countDocuments({ productId: product._id });

      if (existingVariantsCount > 0) {
        console.log(`⏭️  [BỎ QUA] "${product.name}" (${product.sku}) — Đã có ${existingVariantsCount} biến thể.`);
        skippedCount++;
        continue;
      }

      // Đảm bảo SKU của variant không bị trùng với variant khác
      let variantSku = product.sku ? product.sku.toUpperCase() : `SKU-${product._id}`;
      const skuConflict = await ProductVariant.findOne({ sku: variantSku });
      if (skuConflict) {
        variantSku = `${variantSku}-DEF`;
      }

      await ProductVariant.create({
        productId: product._id,
        attributes: [{ name: 'Phân loại', value: 'Mặc định' }],
        displayName: 'Mặc định',
        sku: variantSku,
        price: product.price ?? 0,
        salePrice: product.salePrice ?? 0,
        stock: product.stock ?? 50,
        thumbnail: product.thumbnail,
        images: product.images,
        position: 0,
        isActive: product.isActive !== false,
        isDefault: true,
      });

      console.log(`✅ [ĐÃ TẠO] Default Variant cho: "${product.name}" (SKU: ${variantSku})`);
      createdCount++;
    } catch (err) {
      console.error(`❌ [LỖI] Không thể tạo variant cho "${product.name}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n=============================================');
  console.log('🎉 KẾT QUẢ MIGRATION:');
  console.log(`- Tổng sản phẩm đã quét: ${products.length}`);
  console.log(`- Đã tạo mới Default Variant: ${createdCount}`);
  console.log(`- Đã bỏ qua (đã có variant từ trước): ${skippedCount}`);
  console.log(`- Lỗi: ${errorCount}`);
  console.log('=============================================\n');

  await mongoose.connection.close();
  process.exit(0);
};

runMigration().catch((err) => {
  console.error('❌ Migration thất bại:', err);
  process.exit(1);
});
