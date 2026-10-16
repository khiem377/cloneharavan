const mongoose = require('mongoose');
const Supplier = require('../models/supplier.model');
const PurchaseOrder = require('../models/purchaseOrder.model');
const PurchaseReturn = require('../models/purchaseReturn.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const VN_OFFSET = '+07:00';
const HISTORY_FETCH_CAP = 200; // mỗi loại chứng từ, đủ cho 1 kỳ lọc thông thường
const MAX_PAGE_SIZE = 50;

const pad = (n) => String(n).padStart(2, '0');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Chuẩn hóa khoảng thời gian theo giờ Việt Nam. from/to dạng YYYY-MM-DD, gồm cả ngày cuối.
 * Không truyền from và to => null (tính toàn bộ thời gian). Chỉ truyền một trong hai => lỗi 400.
 */
const resolvePeriod = (from, to) => {
  if (!from && !to) return null;
  if (!from || !to) {
    throw new AppError('Cần truyền đủ cả from và to', 400);
  }
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    throw new AppError('Khoảng thời gian không hợp lệ (định dạng YYYY-MM-DD)', 400);
  }
  const start = new Date(`${from}T00:00:00.000${VN_OFFSET}`);
  const end = new Date(`${to}T23:59:59.999${VN_OFFSET}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new AppError('Khoảng thời gian không hợp lệ', 400);
  }
  return { from, to, start, end };
};

const pick = (arr, key) => {
  const row = (arr && arr[0]) || {};
  return { count: row.count || 0, amount: row[key] || 0 };
};

class SupplierActivityService {
  /**
   * Tổng hợp hoạt động của NCC trong kỳ: 4 chỉ số + lịch sử đơn nhập/đơn trả (phân trang).
   */
  static async getActivity(supplierId, { from, to, page = 1, limit = 10 } = {}) {
    if (!mongoose.isValidObjectId(supplierId)) throw new AppError('ID nhà cung cấp không hợp lệ', 400);
    const exists = await Supplier.exists({ _id: supplierId });
    if (!exists) throw new AppError('Nhà cung cấp không tồn tại', 404);

    const period = resolvePeriod(from, to);
    const oid = new mongoose.Types.ObjectId(supplierId);
    // period = null => toàn bộ thời gian, không lọc theo ngày tạo
    const dateFilter = period ? { createdAt: { $gte: period.start, $lte: period.end } } : {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit, 10) || 10));

    const [poStats, returnStats, orders, returns] = await Promise.all([
      PurchaseOrder.aggregate([
        { $match: { supplierId: oid, ...dateFilter, status: { $ne: 'cancelled' } } },
        {
          $facet: {
            created: [{ $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }],
            receivedUnpaid: [
              {
                $match: {
                  status: { $in: ['completed', 'partial_received'] },
                  paymentStatus: { $ne: 'paid' },
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  amount: { $sum: { $max: [0, { $subtract: [{ $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$paidAmount', 0] }] }] } },
                },
              },
            ],
          },
        },
      ]),
      PurchaseReturn.aggregate([
        { $match: { supplierId: oid, ...dateFilter, status: 'completed' } },
        {
          $facet: {
            created: [{ $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }],
            pendingRefund: [
              { $match: { refundStatus: { $ne: 'paid' } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  amount: { $sum: { $max: [0, { $subtract: [{ $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$refundAmount', 0] }] }] } },
                },
              },
            ],
          },
        },
      ]),
      PurchaseOrder.find({ supplierId: oid, ...dateFilter })
        .select('poNumber status paymentStatus totalAmount paidAmount createdAt')
        .sort({ createdAt: -1 })
        .limit(HISTORY_FETCH_CAP)
        .lean(),
      PurchaseReturn.find({ supplierId: oid, ...dateFilter })
        .select('returnNumber status refundStatus totalAmount refundAmount createdAt')
        .sort({ createdAt: -1 })
        .limit(HISTORY_FETCH_CAP)
        .lean(),
    ]);

    const po = poStats[0] || {};
    const rt = returnStats[0] || {};

    const stats = {
      purchaseOrdersCreated: pick(po.created, 'amount'),
      purchaseOrdersReceivedUnpaid: pick(po.receivedUnpaid, 'amount'),
      returnsCreated: pick(rt.created, 'amount'),
      returnsPendingRefund: pick(rt.pendingRefund, 'amount'),
    };

    const history = [
      ...orders.map((o) => ({
        type: 'purchase_order',
        _id: o._id,
        code: o.poNumber,
        createdAt: o.createdAt,
        totalAmount: o.totalAmount || 0,
        settledAmount: o.paidAmount || 0,
        status: o.status,
        paymentStatus: o.paymentStatus || 'unpaid',
      })),
      ...returns.map((r) => ({
        type: 'purchase_return',
        _id: r._id,
        code: r.returnNumber,
        createdAt: r.createdAt,
        totalAmount: r.totalAmount || 0,
        settledAmount: r.refundAmount || 0,
        status: r.status,
        paymentStatus: r.refundStatus || 'unpaid',
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = history.length;
    const items = history.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return {
      period: period ? { from: period.from, to: period.to } : null,
      stats,
      history: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Danh sách nhân viên để chọn "Nhân viên phụ trách".
   * Không đòi quyền user.view để người quản lý NCC vẫn chọn được.
   */
  static async getStaffOptions() {
    return User.find({ role: { $ne: 'user' }, isActive: true })
      .select('fullName email role')
      .sort({ fullName: 1 })
      .limit(200)
      .lean();
  }
}

module.exports = SupplierActivityService;
