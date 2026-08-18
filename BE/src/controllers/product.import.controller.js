const multer = require('multer');
const {
  generateTemplate, exportProducts, importProducts, syncProductImages, moveMedia,
} = require('../services/product.import.service');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const downloadTemplate = async (req, res, next) => {
  try {
    const buf = await generateTemplate();
    res.setHeader('Content-Disposition', 'attachment; filename="product-template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (e) { next(e); }
};

const exportProductsCtrl = async (req, res, next) => {
  try {
    const buf = await exportProducts(req.query);
    res.setHeader('Content-Disposition', 'attachment; filename="products-export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (e) { next(e); }
};

const importProductsCtrl = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ status: 'error', message: 'Vui lòng chọn file Excel' });
      const result = await importProducts(req.file.buffer);
      res.json({ status: 'success', statusCode: 200, message: 'Import hoàn tất', data: result });
    } catch (e) { next(e); }
  },
];

const syncImagesCtrl = async (req, res, next) => {
  try {
    const result = await syncProductImages();
    res.json({ status: 'success', statusCode: 200, message: `Đã sync ${result.synced} ảnh`, data: result });
  } catch (e) { next(e); }
};

const moveMediaCtrl = async (req, res, next) => {
  try {
    const { targetFolderId } = req.body;
    const media = await moveMedia(req.params.id, targetFolderId);
    res.json({ status: 'success', statusCode: 200, message: 'Đã di chuyển file', data: { media } });
  } catch (e) { next(e); }
};

module.exports = { downloadTemplate, exportProductsCtrl, importProductsCtrl, syncImagesCtrl, moveMediaCtrl };
