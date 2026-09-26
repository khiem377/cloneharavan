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

    const allCategories = await Category.find({}).lean();
    const catBySlug = new Map();
    allCategories.forEach((c) => {
      if (c.slug) catBySlug.set(c.slug.toLowerCase(), c);
    });

    const products = await Product.find({});
    if (products.length > 0) {
      for (const prod of products) {
        const nameLower = (prod.name || '').toLowerCase();
        const textToMatch = `${nameLower} ${(prod.sku || '').toLowerCase()}`;
        const matchedCatIds = new Set();

        const addBySlug = (slug) => {
          const cat = catBySlug.get(slug.toLowerCase());
          if (cat && cat._id) matchedCatIds.add(cat._id.toString());
        };

        const isTv = /\b(?:tivi|ti vi|smart tv|google tivi|android tivi|qled|oled|nanocell)\b/i.test(nameLower) ||
          (/\btv\b/i.test(nameLower) && !nameLower.includes('tủ lạnh') && !nameLower.includes('fridge'));
        const isFridge = /\b(?:tủ lạnh|tu lanh|tủ đông|tu dong|tủ mát|side by side|multi door)\b/i.test(nameLower);
        const isSpeaker = /\b(?:loa|speaker|soundbar|karaoke|am-thanh|amply)\b/i.test(nameLower);
        const isWasher = /\b(?:máy giặt|may giat|máy sấy|may say)\b/i.test(nameLower);
        const isAc = /\b(?:máy lạnh|may lanh|điều hòa|dieu hoa)\b/i.test(nameLower);
        const isKitchen = /\b(?:nồi|bếp|lò vi sóng|lò nướng|máy xay|bình đun|máy ép)\b/i.test(nameLower);

        if (isTv) {
          addBySlug('tivi-man-hinh');
          addBySlug('tivi');
          addBySlug('tivi-loa-dan-karaoke');

          if (textToMatch.includes('smart') || textToMatch.includes('google') || textToMatch.includes('android')) {
            addBySlug('smart-tv');
            addBySlug('smart-tivi');
          }
          if (textToMatch.includes('4k')) {
            addBySlug('tv-4k');
            addBySlug('tivi-4k');
          }
          if (textToMatch.includes('oled') || textToMatch.includes('qled')) {
            addBySlug('tv-oled-qled');
            addBySlug('oled');
          }
          if (textToMatch.includes('mini led')) {
            addBySlug('mini-led');
            addBySlug('tv-mini-led');
          }
          if (textToMatch.includes('8k')) {
            addBySlug('tv-cao-cap-8k');
            addBySlug('cao-cap-8k');
          }
        } else if (isFridge) {
          addBySlug('tu-lanh-tu-dong');
          addBySlug('tu-lanh');
          addBySlug('tu-lanh-tu-dong-tu-mat');

          if (textToMatch.includes('multi door') || textToMatch.includes('multidoor')) {
            addBySlug('tu-lanh-multi-door');
          }
          if (textToMatch.includes('side by side')) {
            addBySlug('tu-lanh-side-by-side');
          }
          if (textToMatch.includes('1 cánh')) {
            addBySlug('tu-lanh-1-canh');
          }
          if (textToMatch.includes('2 cánh')) {
            addBySlug('tu-lanh-2-canh');
          }
          if (textToMatch.includes('tủ đông')) {
            addBySlug('tu-dong');
          }
          if (textToMatch.includes('tủ mát')) {
            addBySlug('tu-mat');
          }
        } else if (isSpeaker) {
          addBySlug('thiet-bi-am-thanh-loa');
          addBySlug('loa-am-thanh');
          addBySlug('nhom-loa-am-thanh');
          addBySlug('nhom-thiet-bi-am-thanh');
          addBySlug('loa-thiet-bi-am-thanh');

          if (textToMatch.includes('kéo') || textToMatch.includes('karaoke')) {
            addBySlug('loa-keo-karaoke');
            addBySlug('loa-keo');
            addBySlug('dan-karaoke');
            if (textToMatch.includes('xách tay')) {
              addBySlug('loa-karaoke-xach-tay');
            }
          }
          if (textToMatch.includes('bluetooth')) {
            addBySlug('loa-bluetooth');
            addBySlug('loa-nghe-nhac-bluetooth');
          }
          if (textToMatch.includes('soundbar') || textToMatch.includes('thanh')) {
            addBySlug('soundbar-tivi');
          }
        } else if (isWasher) {
          addBySlug('may-giat-may-say');
          addBySlug('cot-may-giat-may-say');
          if (textToMatch.includes('cửa trước')) addBySlug('may-giat-cua-truoc');
          if (textToMatch.includes('cửa trên')) addBySlug('may-giat-cua-tren');
          if (textToMatch.includes('sấy')) addBySlug('may-say-quan-ao');
        } else if (isAc) {
          addBySlug('dieu-hoa-dien-lanh');
          addBySlug('may-lanh-dieu-hoa');
          addBySlug('dieu-hoa-lam-mat-phong-ngu');
        } else if (isKitchen) {
          addBySlug('gia-dung-nha-bep');
          addBySlug('cot-thiet-bi-bep');
          addBySlug('thiet-bi-bep');
        }

        if (matchedCatIds.size > 0) {
          prod.categories = Array.from(matchedCatIds);
          await prod.save();
        }
      }
      console.log(`[CategoryAssigner] Successfully matched rich parent & child categories to all ${products.length} products!`);
    }
  } catch (err) {
    console.error('[CategoryAssigner] Error:', err.message);
  }
};

const ensureSamsungVariants = async () => {
  try {
    const Product = require('./src/models/product.model');
    const ProductVariant = require('./src/models/productVariant.model');

    const tv = await Product.findOne({ name: /QA75Q65D/i });
    if (!tv) return;

    tv.price = 37450000;
    tv.salePrice = 14490000;
    tv.cachedPrice = 37450000;
    tv.cachedSalePrice = 14490000;
    tv.options = [
      {
        name: 'Kích thước',
        type: 'text',
        values: [
          { value: '43 inch', colorCode: '' },
          { value: '50 inch', colorCode: '' },
          { value: '55 inch', colorCode: '' },
          { value: '65 inch', colorCode: '' },
          { value: '75 inch', colorCode: '' },
          { value: '85 inch', colorCode: '' },
        ],
      },
    ];
    await tv.save();

    await ProductVariant.deleteMany({ productId: tv._id });

    const sizes = [
      { size: '43 inch', price: 37450000, salePrice: 14490000, sku: '1644150', isDefault: true, stock: 50 },
      { size: '50 inch', price: 37450000, salePrice: 16890000, sku: '1644151', isDefault: false, stock: 45 },
      { size: '55 inch', price: 39990000, salePrice: 18490000, sku: '1644152', isDefault: false, stock: 35 },
      { size: '65 inch', price: 44990000, salePrice: 22990000, sku: '1644153', isDefault: false, stock: 20 },
      { size: '75 inch', price: 54990000, salePrice: 29990000, sku: '1644154', isDefault: false, stock: 15 },
      { size: '85 inch', price: 79990000, salePrice: 45990000, sku: '1644155', isDefault: false, stock: 10 },
    ];

    await ProductVariant.insertMany(
      sizes.map((s, idx) => ({
        productId: tv._id,
        isDefault: s.isDefault,
        attributes: [{ name: 'Kích thước', value: s.size }],
        displayName: `${tv.name} - ${s.size}`,
        sku: s.sku,
        price: s.price,
        salePrice: s.salePrice,
        stock: s.stock,
        position: idx,
        isActive: true,
      }))
    );
    console.log('[VariantSeeder] Successfully seeded 6 size variants for Samsung TV QA75Q65D!');
  } catch (err) {
    console.error('[VariantSeeder] Error:', err.message);
  }
};

connectDB().then(async () => {
  await initElasticsearch();
  await assignCategoriesToProducts();
  await ensureSamsungVariants();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
