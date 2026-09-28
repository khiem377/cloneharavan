const AuditLog = require('../models/auditLog.model');
const Product = require('../models/product.model');
const ProductVariant = require('../models/productVariant.model');
const Category = require('../models/category.model');
const Brand = require('../models/brand.model');
const Coupon = require('../models/coupon.model');
const Promotion = require('../models/promotion.model');
const GiftProgram = require('../models/gift-program.model');
const FlashSale = require('../models/flashSale.model');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Supplier = require('../models/supplier.model');
const Banner = require('../models/banner.model');
const Menu = require('../models/menu.model');
const Tag = require('../models/tag.model');
const BlogPost = require('../models/blogPost.model');
const BlogCategory = require('../models/blogCategory.model');
// Inventory modules
const PurchaseOrder = require('../models/purchaseOrder.model');
const StockExport = require('../models/stockExport.model');
const StockAudit = require('../models/stockAudit.model');
const { calculateDiff } = require('../utils/diff');
const { AppError } = require('../utils/AppError');

const modelMap = {
  PRODUCT: Product,
  PRODUCT_VARIANT: ProductVariant,
  CATEGORY: Category,
  BRAND: Brand,
  COUPON: Coupon,
  PROMOTION: Promotion,
  GIFT_PROGRAM: GiftProgram,
  FLASH_SALE: FlashSale,
  USER: User,
  ROLE: Role,
  SUPPLIER: Supplier,
  BANNER: Banner,
  MENU: Menu,
  TAG: Tag,
  BLOG: BlogPost,
  BLOG_CATEGORY: BlogCategory,
  // Inventory
  PURCHASE_ORDER: PurchaseOrder,
  STOCK_EXPORT: StockExport,
  STOCK_AUDIT: StockAudit,
};

const recordAuditLog = async ({
  req,
  user,
  action,
  module,
  targetId = null,
  targetName = '',
  oldData = null,
  newData = null,
}) => {
  try {
    const activeUser = user || req?.user;
    if (!activeUser) return null;

    const changes = oldData && newData ? calculateDiff(oldData, newData) : [];

    const ipAddress =
      req?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req?.socket?.remoteAddress ||
      '127.0.0.1';

    const userAgent = req?.headers['user-agent'] || 'Unknown';

    return await AuditLog.create({
      userId: activeUser._id,
      userName: activeUser.name || activeUser.email || 'Admin',
      userEmail: activeUser.email || '',
      userRole: activeUser.role || 'admin',
      action,
      module,
      targetId: targetId ? targetId.toString() : null,
      targetName: targetName || '',
      ipAddress,
      userAgent,
      oldData,
      newData,
      changes,
    });
  } catch (error) {
    console.error('AuditLog Recording Error:', error);
    return null;
  }
};

const getAuditLogs = async (query = {}) => {
  const filter = {};

  if (query.module) filter.module = query.module;
  if (query.action) filter.action = query.action;
  if (query.userId) filter.userId = query.userId;
  if (query.targetId) filter.targetId = query.targetId;
  if (query.isRollbacked !== undefined) filter.isRollbacked = query.isRollbacked === 'true';

  if (query.search) {
    filter.$or = [
      { targetName: { $regex: query.search, $options: 'i' } },
      { userName: { $regex: query.search, $options: 'i' } },
      { userEmail: { $regex: query.search, $options: 'i' } },
      { action: { $regex: query.search, $options: 'i' } },
    ];
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'name email avatar role')
      .populate('rollbackedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getAuditLogById = async (id) => {
  const log = await AuditLog.findById(id)
    .populate('userId', 'name email avatar role')
    .populate('rollbackedBy', 'name email');

  if (!log) throw new AppError('Không tìm thấy nhật ký thao tác', 404);
  return log;
};

const rollbackAuditLog = async (id, performingUser, req) => {
  const log = await AuditLog.findById(id);
  if (!log) throw new AppError('Không tìm thấy nhật ký thao tác', 404);

  if (log.isRollbacked) {
    throw new AppError('Nhật ký thao tác này đã được khôi phục trước đó', 400);
  }

  const Model = modelMap[log.module];
  if (!Model) {
    throw new AppError(`Không hỗ trợ khôi phục tự động cho phân hệ ${log.module}`, 400);
  }

  let restoredDoc = null;

  if (log.action === 'DELETE') {
    if (!log.oldData) {
      throw new AppError('Không có dữ liệu cũ để khôi phục', 400);
    }

    const { _id, createdAt, updatedAt, __v, ...restData } = log.oldData;

    restoredDoc = await Model.create({
      _id: log.targetId || _id,
      ...restData,
    });
  } else if (log.action === 'UPDATE') {
    if (!log.oldData) {
      throw new AppError('Không có dữ liệu cũ để khôi phục', 400);
    }

    if (!log.targetId) {
      throw new AppError('Không tìm thấy ID đối tượng để khôi phục', 400);
    }

    const { _id, createdAt, updatedAt, __v, ...restData } = log.oldData;

    restoredDoc = await Model.findByIdAndUpdate(
      log.targetId,
      { $set: restData },
      { new: true, runValidators: false }
    );

    if (!restoredDoc) {
      restoredDoc = await Model.create({
        _id: log.targetId,
        ...restData,
      });
    }
  } else if (log.action === 'CREATE') {
    if (!log.targetId) {
      throw new AppError('Không tìm thấy ID đối tượng để khôi phục', 400);
    }

    await Model.findByIdAndDelete(log.targetId);
  } else {
    throw new AppError(`Hành động ${log.action} không hỗ trợ khôi phục`, 400);
  }

  log.isRollbacked = true;
  log.rollbackedAt = new Date();
  log.rollbackedBy = performingUser._id;
  await log.save();

  await recordAuditLog({
    req,
    user: performingUser,
    action: 'ROLLBACK',
    module: log.module,
    targetId: log.targetId,
    targetName: `[Rollback] ${log.targetName}`,
    oldData: log.newData,
    newData: log.oldData,
  });

  return {
    message: `Đã khôi phục thành công dữ liệu cho ${log.targetName || log.module}`,
    restoredDoc,
    auditLog: log,
  };
};

module.exports = {
  recordAuditLog,
  getAuditLogs,
  getAuditLogById,
  rollbackAuditLog,
};
