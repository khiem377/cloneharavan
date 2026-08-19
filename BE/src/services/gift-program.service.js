const GiftProgram = require('../models/gift-program.model');
const { AppError } = require('../utils/AppError');

const isItemInScope = (item, scope) => {
  if (scope.type === 'all') return true;
  if (scope.type === 'products')
    return scope.productIds.some((id) => id.toString() === item.productId.toString());
  if (scope.type === 'categories')
    return scope.categoryIds.some((id) => id.toString() === item.categoryId?.toString());
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
  const program = await GiftProgram.findById(id).populate(
    'giftProducts.productId',
    'name thumbnail slug'
  );
  if (!program) throw new AppError('Không tìm thấy chương trình tặng kèm', 404);
  return program;
};

const createGiftProgram = async (data) => {
  return GiftProgram.create(data);
};

const updateGiftProgram = async (id, data) => {
  const program = await GiftProgram.findByIdAndUpdate(id, data, { new: true, runValidators: true });
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

const applyGiftPrograms = async (cartItems) => {
  const now = new Date();
  const programs = await GiftProgram.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  const results = [];

  for (const program of programs) {
    if (program.giftLimit !== null && program.giftUsedCount >= program.giftLimit) continue;

    if (program.giftType === 'same_product') {
      for (const item of cartItems) {
        if (!isItemInScope(item, program.scope)) continue;
        if (item.quantity < program.triggerQty) continue;
        const sets = Math.floor(item.quantity / program.triggerQty);
        results.push({
          giftProgramId: program._id,
          giftProgramName: program.name,
          gifts: [{ productId: item.productId, qty: sets * program.giftQty }],
        });
      }
    }

    if (program.giftType === 'different_product') {
      const qualifyingQty = cartItems
        .filter((item) => isItemInScope(item, program.scope))
        .reduce((sum, item) => sum + item.quantity, 0);
      if (qualifyingQty < program.triggerQty) continue;
      const sets = Math.floor(qualifyingQty / program.triggerQty);
      results.push({
        giftProgramId: program._id,
        giftProgramName: program.name,
        gifts: program.giftProducts.map((g) => ({
          productId: g.productId,
          qty: g.qty * sets,
        })),
      });
    }
  }

  return results;
};

const markGiftProgramsUsed = async (giftProgramIds) => {
  if (!giftProgramIds.length) return;
  await GiftProgram.updateMany(
    { _id: { $in: giftProgramIds } },
    { $inc: { giftUsedCount: 1 } }
  );
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
