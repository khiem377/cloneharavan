const GiftProgram = require('../models/gift-program.model');
const ProductVariant = require('../models/productVariant.model');
const { AppError } = require('../utils/AppError');

const isItemInScope = (item, scope) => {
  if (!scope || scope.type === 'all') return true;
  const itemPid = (item.productId?._id || item.productId)?.toString();
  const itemCid = (item.categoryId?._id || item.categoryId)?.toString();

  if (scope.type === 'products' && Array.isArray(scope.productIds)) {
    return scope.productIds.some((id) => {
      const scopePid = (id?._id || id)?.toString();
      return Boolean(scopePid && itemPid && scopePid === itemPid);
    });
  }
  if (scope.type === 'categories' && Array.isArray(scope.categoryIds)) {
    return scope.categoryIds.some((id) => {
      const scopeCid = (id?._id || id)?.toString();
      return Boolean(scopeCid && itemCid && scopeCid === itemCid);
    });
  }
  return false;
};

const getAllGiftPrograms = async (query = {}) => {
  const filter = {};
  if (query.keyword) filter.name = { $regex: query.keyword, $options: 'i' };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.giftType) filter.giftType = query.giftType;

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    GiftProgram.find(filter)
      .populate('giftProducts.productId', 'name thumbnail slug')
      .populate('scope.productIds', 'name thumbnail slug')
      .populate('scope.categoryIds', 'name icon slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    GiftProgram.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getGiftProgramById = async (id) => {
  const program = await GiftProgram.findById(id)
    .populate('giftProducts.productId', 'name thumbnail slug')
    .populate('scope.productIds', 'name thumbnail slug')
    .populate('scope.categoryIds', 'name icon slug');
  if (!program) throw new AppError('Không tìm thấy chương trình tặng kèm', 404);
  return program;
};

const createGiftProgram = async (data) => {
  const program = await GiftProgram.create(data);
  return GiftProgram.findById(program._id)
    .populate('giftProducts.productId', 'name thumbnail slug')
    .populate('scope.productIds', 'name thumbnail slug')
    .populate('scope.categoryIds', 'name icon slug');
};

const updateGiftProgram = async (id, data) => {
  const program = await GiftProgram.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('giftProducts.productId', 'name thumbnail slug')
    .populate('scope.productIds', 'name thumbnail slug')
    .populate('scope.categoryIds', 'name icon slug');
  if (!program) throw new AppError('Không tìm thấy chương trình tặng kèm', 404);
  return program;
};

const deleteGiftProgram = async (id) => {
  const program = await GiftProgram.findByIdAndDelete(id);
  if (!program) throw new AppError('Không tìm thấy chương trình tặng kèm', 404);
};

const toggleGiftProgramStatus = async (id, isActive) => {
  const program = await GiftProgram.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!program) throw new AppError('Không tìm thấy chương trình tặng kèm', 404);
  return program;
};

const deleteBulkGiftPrograms = async (ids) => {
  if (!ids || !ids.length) throw new AppError('Không có chương trình nào được chọn', 400);
  const result = await GiftProgram.deleteMany({ _id: { $in: ids } });
  return { deleted: result.deletedCount };
};

/**
 * Áp dụng chương trình quà tặng kèm (Bảo vệ 2 lớp: Quota ngân sách + Tồn kho thực tế)
 */
const applyGiftPrograms = async (cartItems) => {
  const now = new Date();
  const programs = await GiftProgram.find({
    isActive: true,
    $and: [
      {
        $or: [
          { startDate: { $exists: false } },
          { startDate: null },
          { startDate: { $lte: now } },
        ],
      },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      },
    ],
  })
    .populate('giftProducts.productId', 'name thumbnail price priceCompare slug sku')
    .populate('scope.productIds', 'name thumbnail price priceCompare slug sku');

  const appliedGifts = [];
  const giftNudges = [];

  for (const program of programs) {
    // 1. Kiểm tra Giới hạn số suất (Quota) của chương trình
    if (program.giftLimit !== null && program.giftUsedCount >= program.giftLimit) {
      continue; // Đã hết suất tặng của chương trình
    }

    const remainingSlots = program.giftLimit !== null
      ? Math.max(0, program.giftLimit - (program.giftUsedCount || 0))
      : Infinity;

    // A. CÙNG LOẠI SẢN PHẨM (same_product)
    if (program.giftType === 'same_product') {
      for (const item of cartItems) {
        if (!isItemInScope(item, program.scope)) continue;
        const qty = Number(item.quantity) || 0;
        if (qty <= 0) continue;

        const pId = (item.productId?._id || item.productId)?.toString();
        const vId = item.variantId?.toString();

        // Lấy biến thể để kiểm tra tồn kho khả dụng thực tế
        let variant = null;
        if (vId) {
          variant = await ProductVariant.findById(vId);
        } else if (pId) {
          variant = await ProductVariant.findOne({ productId: pId, isDefault: true })
            || await ProductVariant.findOne({ productId: pId, isActive: true });
        }

        const availableStock = variant
          ? Math.max(0, (variant.stock || 0) - (variant.allocated || 0))
          : 0;

        // Số lượng tồn còn lại sau khi khách đã mua qty sản phẩm chính
        const unreservedStock = Math.max(0, availableStock - qty);

        if (qty >= program.triggerQty) {
          const calculatedSets = Math.floor(qty / program.triggerQty);
          // Giới hạn theo số suất còn lại của chương trình
          const setsAllowed = Math.min(calculatedSets, remainingSlots);
          const rawGiftQty = setsAllowed * (program.giftQty || 1);

          // Giới hạn theo tồn kho thực tế của sản phẩm
          const actualGiftQty = Math.min(rawGiftQty, unreservedStock);

          if (actualGiftQty > 0) {
            appliedGifts.push({
              giftProgramId: program._id,
              giftProgramName: program.name,
              giftType: 'same_product',
              setsApplied: Math.ceil(actualGiftQty / (program.giftQty || 1)),
              gifts: [
                {
                  productId: pId,
                  variantId: variant?._id || null,
                  name: item.productName || item.name || 'Sản phẩm chính',
                  thumbnail: item.thumbnail || '',
                  originalPrice: item.originalPrice || item.unitPrice || 0,
                  slug: item.slug || '',
                  sku: item.sku || variant?.sku || '',
                  qty: actualGiftQty,
                  unitPrice: 0,
                  isGift: true,
                  triggerProductId: pId,
                  availableStock: unreservedStock,
                },
              ],
            });
          }
        } else if (unreservedStock > 0 && remainingSlots > 0) {
          // Chưa đủ điều kiện mua -> Nudge (chỉ gợi ý khi kho vẫn còn quà)
          const neededQty = program.triggerQty - qty;
          giftNudges.push({
            giftProgramId: program._id,
            giftProgramName: program.name,
            triggerProductId: pId,
            triggerProductName: item.productName || item.name,
            triggerQty: program.triggerQty,
            currentQty: qty,
            neededQty,
            giftName: item.productName || item.name,
            giftQty: program.giftQty || 1,
            originalPrice: item.originalPrice || item.unitPrice || 0,
            message: `Mua thêm ${neededQty} sản phẩm để nhận ngay ${program.giftQty || 1} sản phẩm quà tặng (0đ)`,
          });
        }
      }
    }

    // B. KHÁC LOẠI SẢN PHẨM (different_product)
    if (program.giftType === 'different_product') {
      const qualifyingItems = cartItems.filter((item) => isItemInScope(item, program.scope));
      const qualifyingQty = qualifyingItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

      if (qualifyingQty >= program.triggerQty) {
        const calculatedSets = Math.floor(qualifyingQty / program.triggerQty);
        // Giới hạn theo số suất còn lại của chương trình
        const setsAllowed = Math.min(calculatedSets, remainingSlots);

        if (setsAllowed > 0) {
          const giftsList = [];

          for (const g of program.giftProducts || []) {
            const pObj = g.productId;
            const pId = (pObj?._id || g.productId)?.toString();
            if (!pId) continue;

            // Tìm biến thể đại diện có tồn kho của sản phẩm quà tặng
            const variant = await ProductVariant.findOne({ productId: pId, isDefault: true, isActive: true })
              || await ProductVariant.findOne({ productId: pId, isActive: true }).sort({ stock: -1, _id: 1 });

            const availableStock = variant
              ? Math.max(0, (variant.stock || 0) - (variant.allocated || 0))
              : 0;

            const rawGiftQty = (Number(g.qty) || 1) * setsAllowed;
            // Giới hạn theo tồn kho thực tế của sản phẩm quà tặng
            const actualGiftQty = Math.min(rawGiftQty, availableStock);

            if (actualGiftQty > 0) {
              const name = pObj?.name || 'Sản phẩm quà tặng';
              let thumb = '';
              if (typeof pObj?.thumbnail === 'string') {
                thumb = pObj.thumbnail;
              } else if (pObj?.thumbnail?.url) {
                thumb = pObj.thumbnail.url;
              }
              const origPrice = Number(pObj?.price) || Number(pObj?.priceCompare) || 0;

              giftsList.push({
                productId: pId,
                variantId: variant?._id || null,
                name,
                thumbnail: thumb,
                originalPrice: origPrice,
                slug: pObj?.slug || '',
                sku: pObj?.sku || variant?.sku || '',
                qty: actualGiftQty,
                unitPrice: 0,
                isGift: true,
                triggerProductIds: qualifyingItems.map((it) => (it.productId?._id || it.productId)?.toString()),
                availableStock,
              });
            }
          }

          if (giftsList.length > 0) {
            appliedGifts.push({
              giftProgramId: program._id,
              giftProgramName: program.name,
              giftType: 'different_product',
              setsApplied: setsAllowed,
              gifts: giftsList,
            });
          }
        }
      } else if (qualifyingQty > 0 && remainingSlots > 0) {
        // Chưa đủ điều kiện -> Nudge
        const neededQty = program.triggerQty - qualifyingQty;
        const giftNames = (program.giftProducts || [])
          .map((g) => g.productId?.name)
          .filter(Boolean)
          .join(', ');

        for (const qItem of qualifyingItems) {
          const qPid = (qItem.productId?._id || qItem.productId)?.toString();
          giftNudges.push({
            giftProgramId: program._id,
            giftProgramName: program.name,
            triggerProductId: qPid,
            triggerProductName: qItem.productName || qItem.name,
            triggerQty: program.triggerQty,
            currentQty: qualifyingQty,
            neededQty,
            giftName: giftNames || 'Quà tặng',
            message: `Mua thêm ${neededQty} sản phẩm để nhận ngay ${giftNames || 'quà tặng kèm'} (0đ)`,
          });
        }
      }
    }
  }

  return {
    appliedGifts,
    giftNudges,
  };
};

/**
 * Ghi nhận số lượt sử dụng chương trình quà tặng kèm (Atomic transaction-safe)
 */
const markGiftProgramsUsed = async (programUsages = [], session = null) => {
  if (!Array.isArray(programUsages) || !programUsages.length) return;

  for (const usage of programUsages) {
    const programId = usage.giftProgramId || usage._id || usage;
    const count = Number(usage.setsApplied) || Number(usage.count) || 1;

    const query = {
      _id: programId,
      $or: [
        { giftLimit: null },
        { $expr: { $lte: [{ $add: ['$giftUsedCount', count] }, '$giftLimit'] } },
      ],
    };

    const update = { $inc: { giftUsedCount: count } };
    const options = session ? { session, new: true } : { new: true };

    await GiftProgram.findOneAndUpdate(query, update, options);
  }
};

module.exports = {
  getAllGiftPrograms,
  getGiftProgramById,
  createGiftProgram,
  updateGiftProgram,
  deleteGiftProgram,
  deleteBulkGiftPrograms,
  toggleGiftProgramStatus,
  applyGiftPrograms,
  markGiftProgramsUsed,
};
