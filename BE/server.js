require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initElasticsearch } = require('./src/config/elasticsearch');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

const assignCategoriesToProducts = async () => {
  try {
    const Product = require('./src/models/product.model');
    const Category = require('./src/models/category.model');

    const CATEGORY_RULES = [
      { keywords: ['loa', 'speaker', 'soundbar', 'audio', 'karaoke', 'tai nghe'], name: 'Thiết bị Âm thanh & Loa', slug: 'thiet-bi-am-thanh-loa' },
      { keywords: ['tivi', 'tv', 'màn hình', 'display'], name: 'Tivi & Màn hình', slug: 'tivi-man-hinh' },
      { keywords: ['tủ lạnh', 'fridge', 'refrigerator', 'tủ đông'], name: 'Tủ lạnh & Tủ đông', slug: 'tu-lanh-tu-dong' },
      { keywords: ['máy giặt', 'giặt', 'sấy', 'washing'], name: 'Máy giặt & Máy sấy', slug: 'may-giat-may-say' },
      { keywords: ['điều hòa', 'máy lạnh', 'quạt', 'air-conditioner'], name: 'Điều hòa & Điện lạnh', slug: 'dieu-hoa-dien-lanh' },
      { keywords: ['nồi', 'bếp', 'lò vi sóng', 'lò nướng', 'máy xay', 'bình đun'], name: 'Gia dụng Nhà bếp', slug: 'gia-dung-nha-bep' },
      { keywords: ['điện thoại', 'phone', 'smartphone', 'iphone', 'samsung galaxy'], name: 'Điện thoại & Phụ kiện', slug: 'dien-thoai-phu-kien' },
      { keywords: ['laptop', 'máy tính', 'pc', 'macbook'], name: 'Laptop & Máy tính', slug: 'laptop-may-tinh' },
    ];

    const categoryMap = new Map();
    for (const rule of CATEGORY_RULES) {
      let cat = await Category.findOne({ $or: [{ name: rule.name }, { slug: rule.slug }] });
      if (!cat) {
        cat = await Category.create({ name: rule.name, slug: rule.slug, isActive: true, order: 1 });
      }
      categoryMap.set(rule.name, cat);
    }

    let defaultCategory = await Category.findOne({ name: 'Thiết bị Điện máy khác' });
    if (!defaultCategory) {
      defaultCategory = await Category.create({ name: 'Thiết bị Điện máy khác', slug: 'thiet-bi-dien-may-khac', isActive: true, order: 99 });
    }

    const products = await Product.find({});
    if (products.length > 0) {
      for (const prod of products) {
        const textToMatch = `${prod.name || ''} ${prod.sku || ''}`.toLowerCase();
        let matchedCategory = null;
        for (const rule of CATEGORY_RULES) {
          if (rule.keywords.some((kw) => textToMatch.includes(kw))) {
            matchedCategory = categoryMap.get(rule.name);
            break;
          }
        }
        const targetCat = matchedCategory || defaultCategory;
        prod.categories = [targetCat._id];
        await prod.save();
      }
      console.log(`[CategoryAssigner] Successfully assigned categories array to all ${products.length} products!`);
    }
  } catch (err) {
    console.error('[CategoryAssigner] Error:', err.message);
  }
};

connectDB().then(async () => {
  await initElasticsearch();
  await assignCategoriesToProducts();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
