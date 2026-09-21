const express = require('express');
const router = express.Router();
const StockMovement = require('../models/stockMovement.model');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/', protect, requirePermission('stock_movement.view'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, productId, type, keyword = '' } = req.query;
    const query = {};

    if (productId) query.productId = productId;
    if (type) query.type = type;
    if (keyword) {
      query.$or = [
        { productName: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } },
        { referenceNumber: { $regex: keyword, $options: 'i' } },
        { reason: { $regex: keyword, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      StockMovement.find(query)
        .populate('productId', 'name code thumbnail')
        .populate('variantId', 'displayName color size options')
        .populate('createdById', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockMovement.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
