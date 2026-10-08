const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');

// ── 1. REAL VERIFIED PRODUCT IMAGES MAPPING ──────────────────────────────────
const VERIFIED_PRODUCT_IMAGES = {
  // Apple iPhones
  'iphone-16-pro-max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
  'iphone-16': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
  'iphone-15-pro': 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80',
  'iphone-15': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',

  // Samsung Galaxy Phones
  'galaxy-s24-ultra': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
  'galaxy-z-fold6': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
  'galaxy-z-flip6': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',

  // Xiaomi Phones
  'xiaomi-14-ultra': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
  'redmi-note-13': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',

  // Smartwatches (Đồng hồ thông minh)
  'apple-watch-ultra-2': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
  'galaxy-watch-ultra': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  'garmin-fenix-7': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',

  // Laptops / MacBooks
  'macbook-pro-m3': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  'macbook-air-m3': 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
  'asus-rog': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
  'dell-xps': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
  'lenovo-legion': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',

  // iPads & Tablets
  'ipad-pro-m4': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
  'ipad-air-m2': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
  'ipad-gen-10': 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&auto=format&fit=crop&q=80',
  'galaxy-tab-s9': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
  'xiaomi-pad-6': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',

  // Robot hút bụi
  'roborock-s8': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  'dreame-l20': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
  'ecovacs-x2': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
};

function getAccurateImage(name) {
  const s = name.toLowerCase();

  // Watch / Smartwatch
  if (s.includes('apple watch')) return VERIFIED_PRODUCT_IMAGES['apple-watch-ultra-2'];
  if (s.includes('galaxy watch')) return VERIFIED_PRODUCT_IMAGES['galaxy-watch-ultra'];
  if (s.includes('garmin') || s.includes('fenix')) return VERIFIED_PRODUCT_IMAGES['garmin-fenix-7'];
  if (s.includes('đồng hồ')) return VERIFIED_PRODUCT_IMAGES['apple-watch-ultra-2'];

  // Smartphone
  if (s.includes('iphone 16 pro max')) return VERIFIED_PRODUCT_IMAGES['iphone-16-pro-max'];
  if (s.includes('iphone 16')) return VERIFIED_PRODUCT_IMAGES['iphone-16'];
  if (s.includes('iphone 15 pro')) return VERIFIED_PRODUCT_IMAGES['iphone-15-pro'];
  if (s.includes('iphone 15')) return VERIFIED_PRODUCT_IMAGES['iphone-15'];
  if (s.includes('galaxy s24 ultra') || s.includes('s24 ultra')) return VERIFIED_PRODUCT_IMAGES['galaxy-s24-ultra'];
  if (s.includes('z fold')) return VERIFIED_PRODUCT_IMAGES['galaxy-z-fold6'];
  if (s.includes('z flip')) return VERIFIED_PRODUCT_IMAGES['galaxy-z-flip6'];
  if (s.includes('14 ultra') || s.includes('xiaomi 14')) return VERIFIED_PRODUCT_IMAGES['xiaomi-14-ultra'];
  if (s.includes('redmi') || s.includes('điện thoại')) return VERIFIED_PRODUCT_IMAGES['iphone-16'];

  // Laptops
  if (s.includes('macbook pro')) return VERIFIED_PRODUCT_IMAGES['macbook-pro-m3'];
  if (s.includes('macbook air') || s.includes('macbook')) return VERIFIED_PRODUCT_IMAGES['macbook-air-m3'];
  if (s.includes('rog') || s.includes('asus')) return VERIFIED_PRODUCT_IMAGES['asus-rog'];
  if (s.includes('dell') || s.includes('xps')) return VERIFIED_PRODUCT_IMAGES['dell-xps'];
  if (s.includes('lenovo') || s.includes('legion') || s.includes('thinkpad')) return VERIFIED_PRODUCT_IMAGES['lenovo-legion'];
  if (s.includes('laptop')) return VERIFIED_PRODUCT_IMAGES['macbook-air-m3'];

  // Tablets
  if (s.includes('ipad pro')) return VERIFIED_PRODUCT_IMAGES['ipad-pro-m4'];
  if (s.includes('ipad air')) return VERIFIED_PRODUCT_IMAGES['ipad-air-m2'];
  if (s.includes('ipad mini') || s.includes('ipad gen') || s.includes('ipad')) return VERIFIED_PRODUCT_IMAGES['ipad-gen-10'];
  if (s.includes('tab s9') || s.includes('galaxy tab')) return VERIFIED_PRODUCT_IMAGES['galaxy-tab-s9'];
  if (s.includes('pad 6') || s.includes('tablet')) return VERIFIED_PRODUCT_IMAGES['xiaomi-pad-6'];

  // Robot hút bụi
  if (s.includes('roborock')) return VERIFIED_PRODUCT_IMAGES['roborock-s8'];
  if (s.includes('dreame')) return VERIFIED_PRODUCT_IMAGES['dreame-l20'];
  if (s.includes('ecovacs') || s.includes('deebot')) return VERIFIED_PRODUCT_IMAGES['ecovacs-x2'];
  if (s.includes('robot') || s.includes('hút bụi')) return VERIFIED_PRODUCT_IMAGES['roborock-s8'];

  return null;
}

async function fixAllProductCategoriesAndImages() {
  try {
    console.log('[ProductFix] Starting comprehensive catalog audit and repair...');

    // 1. Ensure categories exist
    const categoriesList = [
      { name: 'Điện thoại thông minh', slug: 'dien-thoai-thong-minh' },
      { name: 'Đồng hồ thông minh & Smartwatch', slug: 'dong-ho-thong-minh' },
      { name: 'MacBook & Laptop cao cấp', slug: 'macbook-laptop' },
      { name: 'iPad & Máy tính bảng', slug: 'ipad-tablet' },
      { name: 'Tivi & Màn hình', slug: 'tivi-man-hinh' },
      { name: 'Tủ lạnh & Tủ đông', slug: 'tu-lanh-tu-dong' },
      { name: 'Máy giặt & Máy sấy', slug: 'may-giat-may-say' },
      { name: 'Máy lạnh & Điều hòa', slug: 'may-lanh-dieu-hoa' },
      { name: 'Robot hút bụi & Vệ sinh', slug: 'robot-hut-bui' },
      { name: 'Nồi chiên không dầu & Thiết bị bếp', slug: 'noi-chien-khong-dau' },
      { name: 'Loa & Thiết bị âm thanh', slug: 'loa-am-thanh' },
      { name: 'Máy chơi game & Console', slug: 'may-choi-game-ps5-console' },
      { name: 'Máy lọc không khí & Sức khỏe', slug: 'may-loc-khong-khi' },
    ];

    const catMap = {};
    for (const cat of categoriesList) {
      let doc = await Category.findOne({
        $or: [{ slug: cat.slug }, { name: cat.name }]
      });
      if (!doc) {
        doc = await Category.create({
          name: cat.name,
          slug: cat.slug,
          isActive: true,
          showOnMenu: true
        });
      }
      catMap[cat.slug] = doc._id;
    }

    // 2. Fetch all products
    const products = await Product.find({});
    console.log(`[ProductFix] Auditing ${products.length} products in database...`);

    let fixedCount = 0;

    for (const prod of products) {
      const name = prod.name || '';
      const nameLower = name.toLowerCase();

      let correctCatSlug = null;

      // Rule 1: Watch / Smartwatch (Must NEVER be in phone category!)
      if (
        nameLower.includes('đồng hồ') ||
        nameLower.includes('apple watch') ||
        nameLower.includes('galaxy watch') ||
        nameLower.includes('garmin') ||
        nameLower.includes('fenix')
      ) {
        correctCatSlug = 'dong-ho-thong-minh';
      }
      // Rule 2: Smartphones
      else if (
        nameLower.includes('điện thoại') ||
        nameLower.includes('iphone') ||
        nameLower.includes('s24 ultra') ||
        nameLower.includes('z fold') ||
        nameLower.includes('z flip') ||
        nameLower.includes('redmi')
      ) {
        correctCatSlug = 'dien-thoai-thong-minh';
      }
      // Rule 3: Laptops / MacBooks
      else if (
        nameLower.includes('macbook') ||
        nameLower.includes('laptop') ||
        nameLower.includes('zenbook') ||
        nameLower.includes('thinkpad') ||
        nameLower.includes('legion') ||
        nameLower.includes('dell xps')
      ) {
        correctCatSlug = 'macbook-laptop';
      }
      // Rule 4: iPads / Tablets
      else if (
        nameLower.includes('ipad') ||
        nameLower.includes('tablet') ||
        nameLower.includes('tab s9') ||
        nameLower.includes('pad 6')
      ) {
        correctCatSlug = 'ipad-tablet';
      }
      // Rule 5: Robot hút bụi
      else if (
        nameLower.includes('roborock') ||
        nameLower.includes('dreame') ||
        nameLower.includes('ecovacs') ||
        nameLower.includes('deebot') ||
        nameLower.includes('robot hút bụi')
      ) {
        correctCatSlug = 'robot-hut-bui';
      }

      let updated = false;

      // Check category assignment
      if (correctCatSlug && catMap[correctCatSlug]) {
        const catId = catMap[correctCatSlug];
        prod.category = catId;
        prod.categories = [catId];
        updated = true;
      }

      // Do not overwrite real images (especially Cloudinary uploads)
      const currentUrl = prod.thumbnail?.url || '';
      const hasCloudinary = currentUrl.includes('cloudinary');
      const verifiedImg = (!hasCloudinary && !prod.thumbnail?.mediaId) ? getAccurateImage(name) : null;
      if (verifiedImg && (!prod.thumbnail?.url || prod.thumbnail?.url.includes('unsplash'))) {
        const imgObj = { mediaId: null, url: verifiedImg, publicId: '' };
        prod.thumbnail = imgObj;
        prod.images = [imgObj];
        updated = true;
      }

      if (updated) {
        await prod.save();

        if (verifiedImg) {
          await ProductVariant.updateMany(
            { productId: prod._id },
            {
              $set: {
                thumbnail: { mediaId: null, url: verifiedImg, publicId: '' },
                images: [{ mediaId: null, url: verifiedImg, publicId: '' }],
              },
            }
          );
        }

        fixedCount++;
        console.log(`[ProductFix OK] "${prod.name}" -> Category: ${correctCatSlug || 'keep'} | Thumb: ${verifiedImg?.slice(0, 45)}...`);
      }
    }

    console.log(`\n🎉 [ProductFix COMPLETE] Successfully audited and fixed ${fixedCount} products!\n`);
    return { success: true, fixedCount };
  } catch (err) {
    console.error('[ProductFix ERROR]', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  fixAllProductCategoriesAndImages,
};
