const ExcelJS = require('exceljs');
const axios = require('axios');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const Media = require('../models/media.model');
const Folder = require('../models/folder.model');
const { AppError } = require('../utils/AppError');
const { slugify } = require('../utils/slugify');
const { uploadToCloudinary } = require('../config/cloudinary');

const COLS = [
  { key: 'name', header: 'Tên sản phẩm *', width: 35 },
  { key: 'product_code', header: 'Mã sản phẩm (để trống tự sinh)', width: 25 },
  { key: 'price', header: 'Giá niêm yết (Default Variant) *', width: 20 },
  { key: 'salePrice', header: 'Giá KM (Default Variant)', width: 20 },
  { key: 'stock', header: 'Tồn kho (Default Variant) *', width: 15 },
  { key: 'category', header: 'Danh mục *', width: 25 },
  { key: 'brand', header: 'Thương hiệu *', width: 20 },
  { key: 'status', header: 'Trạng thái', width: 15 },
  { key: 'isFeatured', header: 'Nổi bật', width: 10 },
  { key: 'isHot', header: 'Hot', width: 10 },
  { key: 'thumbnail_url', header: 'Ảnh đại diện (URL)', width: 50 },
  { key: 'gallery_urls', header: 'Ảnh bộ sưu tập (URL, cách nhau dấu phẩy)', width: 60 },
  { key: 'description', header: 'Mô tả', width: 40 },
];

const generateTemplate = async () => {
  const [categories, brands] = await Promise.all([
    Category.find({ isActive: true }, 'name').lean(),
    Brand.find({ isActive: true }, 'name').lean(),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Admin';

  const ws = wb.addWorksheet('Sản phẩm');

  ws.columns = COLS.map((c) => ({ key: c.key, header: c.header, width: c.width }));

  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF334155' } },
    };
  });
  headerRow.height = 30;

  const dataStart = 2;
  const dataEnd = 1001;

  const catNames = categories.map((c) => c.name);
  const brandNames = brands.map((b) => b.name);

  ws.dataValidations.add(`F${dataStart}:F${dataEnd}`, {
    type: 'list', allowBlank: true,
    formulae: [`"${catNames.join(',')}"`],
    showErrorMessage: true, errorTitle: 'Lỗi', error: 'Vui lòng chọn danh mục từ danh sách',
  });

  ws.dataValidations.add(`G${dataStart}:G${dataEnd}`, {
    type: 'list', allowBlank: true,
    formulae: [`"${brandNames.join(',')}"`],
    showErrorMessage: true, errorTitle: 'Lỗi', error: 'Vui lòng chọn thương hiệu từ danh sách',
  });

  ws.dataValidations.add(`H${dataStart}:H${dataEnd}`, {
    type: 'list', allowBlank: true,
    formulae: ['"published,draft,archived"'],
  });

  ws.dataValidations.add(`I${dataStart}:I${dataEnd}`, {
    type: 'list', allowBlank: true,
    formulae: ['"true,false"'],
  });

  ws.dataValidations.add(`J${dataStart}:J${dataEnd}`, {
    type: 'list', allowBlank: true,
    formulae: ['"true,false"'],
  });

  for (let r = dataStart; r <= dataStart + 4; r++) {
    const row = ws.getRow(r);
    ['C', 'D', 'E'].forEach((col) => {
      const cell = ws.getCell(`${col}${r}`);
      cell.numFmt = '#,##0';
    });
    row.height = 20;
  }

  const buf = await wb.xlsx.writeBuffer();
  return buf;
};

const exportProducts = async (query = {}) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = query.brand;
  if (query.status) filter.status = query.status;

  const products = await Product.find(filter)
    .populate('category', 'name')
    .populate('brand', 'name')
    .lean();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sản phẩm');

  ws.columns = COLS.map((c) => ({ key: c.key, header: c.header, width: c.width }));

  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  headerRow.height = 28;

  products.forEach((p) => {
    ws.addRow({
      name: p.name,
      product_code: p.productCode,
      price: '',
      salePrice: '',
      stock: '',
      category: p.category?.name || '',
      brand: p.brand?.name || '',
      status: p.status,
      isFeatured: p.isFeatured ? 'true' : 'false',
      isHot: p.isHot ? 'true' : 'false',
      thumbnail_url: p.thumbnail?.url || '',
      gallery_urls: p.images?.map((i) => i.url).join(', ') || '',
      description: p.description || '',
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  return buf;
};

const importProducts = async (buffer) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];

  const [categories, brands] = await Promise.all([
    Category.find({}, 'name _id').lean(),
    Brand.find({}, 'name _id').lean(),
  ]);

  const catMap = {};
  categories.forEach((c) => { catMap[c.name.trim().toLowerCase()] = c._id; });
  const brandMap = {};
  brands.forEach((b) => { brandMap[b.name.trim().toLowerCase()] = b._id; });

  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] };

  const rows = [];
  ws.eachRow((row, rowNum) => { if (rowNum > 1) rows.push({ row, rowNum }); });

  for (const { row, rowNum } of rows) {
    const get = (key) => {
      const idx = COLS.findIndex((c) => c.key === key);
      const cell = row.getCell(idx + 1);
      const v = cell?.value;
      if (v === null || v === undefined) return '';
      if (typeof v === 'object' && v.result !== undefined) return String(v.result).trim();
      return String(v).trim();
    };

    const name = get('name');
    const productCodeRaw = get('product_code');
    const price = Number(get('price').replace(/[^0-9.]/g, ''));

    if (!name || !price) {
      results.errors.push({ row: rowNum, message: 'Thiếu Tên / Giá' });
      results.skipped++;
      continue;
    }

    const catName = get('category').toLowerCase();
    const brandName = get('brand').toLowerCase();
    const categoryId = catMap[catName];
    const brandId = brandMap[brandName];

    if (!categoryId) {
      results.errors.push({ row: rowNum, message: `Không tìm thấy danh mục: "${get('category')}"` });
      results.skipped++;
      continue;
    }
    if (!brandId) {
      results.errors.push({ row: rowNum, message: `Không tìm thấy thương hiệu: "${get('brand')}"` });
      results.skipped++;
      continue;
    }

    // Tự sinh productCode nếu admin không điền
    const baseCode = productCodeRaw
      ? productCodeRaw.toUpperCase().trim()
      : slugify(name).toUpperCase().replace(/[^A-Z0-9-]/g, '').replace(/-+/g, '-').slice(0, 50);

    const thumbnailUrl = get('thumbnail_url');
    const galleryRaw = get('gallery_urls');
    const galleryUrls = galleryRaw ? galleryRaw.split(',').map((u) => u.trim()).filter(Boolean) : [];
    const stock = Number(get('stock')) || 0;
    const salePrice = Number(get('salePrice').replace(/[^0-9.]/g, '')) || 0;

    const payload = {
      name,
      slug: slugify(name),
      category: categoryId,
      brand: brandId,
      status: ['published', 'draft', 'archived'].includes(get('status')) ? get('status') : 'draft',
      isFeatured: get('isFeatured') === 'true',
      isHot: get('isHot') === 'true',
      description: get('description'),
      thumbnail: thumbnailUrl ? { url: thumbnailUrl, publicId: '', mediaId: null } : undefined,
      images: galleryUrls.map((u) => ({ url: u, publicId: '', mediaId: null })),
    };

    try {
      const existing = await Product.findOne({ productCode: baseCode });
      if (existing) {
        await Product.findByIdAndUpdate(existing._id, payload);
        results.updated++;
      } else {
        // Đảm bảo productCode unique
        let finalCode = baseCode;
        let cnt = 1;
        while (await Product.findOne({ productCode: finalCode })) {
          finalCode = `${baseCode}-${cnt++}`;
        }
        const newProduct = await Product.create({ ...payload, productCode: finalCode });
        results.inserted++;

        // Tự động tạo 1 Default Variant (SKU = productCode)
        await ProductVariant.create({
          productId: newProduct._id,
          attributes: [{ name: 'Phân loại', value: 'Mặc định' }],
          displayName: 'Mặc định',
          sku: newProduct.productCode,
          isManualSku: false,
          price,
          salePrice,
          stock,
          thumbnail: newProduct.thumbnail,
          images: newProduct.images,
          position: 0,
          isActive: newProduct.status !== 'draft',
          isDefault: true,
        });
      }
    } catch (err) {
      results.errors.push({ row: rowNum, message: err.message });
      results.skipped++;
    }
  }

  return results;
};

const syncProductImages = async () => {
  const productsWithRawUrls = await Product.find({
    $or: [
      { 'thumbnail.url': { $exists: true, $ne: '' }, 'thumbnail.mediaId': null },
      { 'images.mediaId': null, 'images.url': { $exists: true, $ne: '' } },
    ],
  }).populate('category', 'name slug').lean();

  let synced = 0;
  const errors = [];

  let sanPhamFolder = await Folder.findOne({ slug: 'san-pham', parentId: null });
  if (!sanPhamFolder) {
    sanPhamFolder = await Folder.create({ name: 'Sản phẩm', slug: 'san-pham' });
  }

  for (const product of productsWithRawUrls) {
    const catSlug = product.category?.slug || 'khac';
    const catName = product.category?.name || 'Khác';

    let catFolder = await Folder.findOne({ slug: catSlug, parentId: sanPhamFolder._id });
    if (!catFolder) {
      catFolder = await Folder.create({ name: catName, slug: catSlug, parentId: sanPhamFolder._id });
    }

    const productSlug = product.slug;
    let productFolder = await Folder.findOne({ slug: productSlug, parentId: catFolder._id });
    if (!productFolder) {
      productFolder = await Folder.create({ name: product.name, slug: productSlug, parentId: catFolder._id });
    }

    const cloudPath = `${sanPhamFolder.slug}/${catSlug}/${productSlug}`;

    const trySync = async (url) => {
      try {
        const resp = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
        const buffer = Buffer.from(resp.data);
        const result = await uploadToCloudinary(buffer, cloudPath);
        const filename = url.split('/').pop().split('?')[0] || 'image.jpg';
        const media = await Media.create({
          filename,
          url: result.secure_url,
          publicId: result.public_id,
          folderId: productFolder._id,
          mimeType: 'image/jpeg',
          size: result.bytes,
          width: result.width,
          height: result.height,
        });
        synced++;
        return { mediaId: media._id, url: result.secure_url, publicId: result.public_id };
      } catch (e) {
        errors.push({ productId: product._id, url, message: e.message });
        return null;
      }
    };

    const updates = {};

    if (product.thumbnail?.url && !product.thumbnail?.mediaId) {
      const synced_media = await trySync(product.thumbnail.url);
      if (synced_media) updates.thumbnail = synced_media;
    }

    const newImages = [];
    for (const img of (product.images || [])) {
      if (img.url && !img.mediaId) {
        const synced_media = await trySync(img.url);
        newImages.push(synced_media || img);
      } else {
        newImages.push(img);
      }
    }
    if (newImages.length) updates.images = newImages;

    if (Object.keys(updates).length) {
      await Product.findByIdAndUpdate(product._id, updates);
    }
  }

  return { synced, errors, total: productsWithRawUrls.length };
};

const moveMedia = async (mediaId, targetFolderId) => {
  const media = await Media.findById(mediaId);
  if (!media) throw new AppError('Không tìm thấy file', 404);

  const targetFolder = await Folder.findById(targetFolderId);
  if (!targetFolder) throw new AppError('Không tìm thấy folder đích', 404);

  media.folderId = targetFolderId;
  await media.save();
  await media.populate({ path: 'folderId', select: 'name slug _id' });
  return media;
};

module.exports = { generateTemplate, exportProducts, importProducts, syncProductImages, moveMedia };
