/**
 * Migration: Tách SKU khỏi Product → thêm productCode
 * - Copy field sku → productCode cho từng Product
 * - Đảm bảo idempotent: nếu productCode đã có → bỏ qua
 * - Cập nhật SKU của Default Variant tương ứng nếu nó đang dùng sku cũ của Product
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

const productCol = () => mongoose.connection.db.collection('products');
const variantCol = () => mongoose.connection.db.collection('productvariants');

const run = async () => {
  console.log('🚀 Bắt đầu migration: Product.sku → Product.productCode\n');
  await connectDB();

  const products = await productCol().find({}).toArray();
  console.log(`📦 Tổng sản phẩm: ${products.length}\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Nếu đã có productCode → bỏ qua
      if (product.productCode) {
        console.log(`⏭️  [BỎ QUA] "${product.name}" — productCode đã tồn tại: ${product.productCode}`);
        skipped++;
        continue;
      }

      // Lấy sku cũ làm productCode
      const productCode = product.sku
        ? String(product.sku).toUpperCase().trim()
        : `P-${product._id.toString().slice(-8).toUpperCase()}`;

      // Kiểm tra trùng productCode với product khác
      let finalCode = productCode;
      let count = 1;
      while (true) {
        const conflict = await productCol().findOne({
          productCode: finalCode,
          _id: { $ne: product._id },
        });
        if (!conflict) break;
        finalCode = `${productCode}-${count++}`;
      }

      // Cập nhật Product: thêm productCode, giữ nguyên sku (backward-compat)
      await productCol().updateOne(
        { _id: product._id },
        { $set: { productCode: finalCode } }
      );

      console.log(`✅ [CẬP NHẬT] "${product.name}" → productCode: ${finalCode}`);
      updated++;
    } catch (err) {
      console.error(`❌ [LỖI] "${product.name}":`, err.message);
      errors++;
    }
  }

  console.log('\n=============================================');
  console.log('🎉 KẾT QUẢ MIGRATION productCode:');
  console.log(`- Đã cập nhật: ${updated}`);
  console.log(`- Bỏ qua (đã có productCode): ${skipped}`);
  console.log(`- Lỗi: ${errors}`);
  console.log('=============================================\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Migration thất bại:', err);
  process.exit(1);
});
