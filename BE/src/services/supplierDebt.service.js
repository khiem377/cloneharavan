const mongoose = require('mongoose');
const SupplierDebt = require('../models/supplierDebt.model');
const SupplierDebtTransaction = require('../models/supplierDebtTransaction.model');
const Supplier = require('../models/supplier.model');
const Warehouse = require('../models/warehouse.model');
const AppError = require('../utils/AppError');

class SupplierDebtService {
  /**
   * Lấy danh sách công nợ của 1 nhà cung cấp kèm thống kê tổng phải thu / phải trả / nợ ròng
   */
  static async getSupplierDebts(supplierId, query = {}) {
    const { status, debtType, page = 1, limit = 50 } = query;
    const filter = { supplierId };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (debtType && debtType !== 'all') {
      filter.debtType = debtType;
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [debts, total, summaryData] = await Promise.all([
      SupplierDebt.find(filter)
        .populate('warehouseId', 'name code isDefault')
        .populate('createdById', 'fullName name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      SupplierDebt.countDocuments(filter),
      SupplierDebt.aggregate([
        { $match: { supplierId: new mongoose.Types.ObjectId(supplierId), status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$debtType',
            totalRemaining: { $sum: '$remainingAmount' },
            totalAmount: { $sum: '$totalAmount' },
            totalPaid: { $sum: '$paidAmount' },
          },
        },
      ]),
    ]);

    let totalPayable = 0;
    let totalReceivable = 0;

    summaryData.forEach((s) => {
      if (s._id === 'payable') {
        totalPayable = s.totalRemaining || 0;
      } else if (s._id === 'receivable') {
        totalReceivable = s.totalRemaining || 0;
      }
    });

    const netDebt = totalPayable - totalReceivable;

    return {
      debts,
      total,
      summary: {
        totalPayable,
        totalReceivable,
        netDebt,
      },
    };
  }

  /**
   * Tạo thủ công một khoản công nợ (Phải trả / Phải thu)
   */
  static async createManualDebt(supplierId, payload, user = null) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 404);

    const {
      name,
      debtType = 'payable',
      warehouseId,
      totalAmount,
      dueDate,
      note,
    } = payload;

    const amount = Number(totalAmount);
    if (!amount || amount <= 0) {
      throw new AppError('Số tiền công nợ phải lớn hơn 0', 400);
    }

    let whId = warehouseId;
    if (!whId) {
      const defaultWh = await Warehouse.findOne({ isDefault: true }).select('_id');
      whId = defaultWh?._id || null;
    }

    const debt = await SupplierDebt.create({
      supplierId,
      warehouseId: whId,
      name: name?.trim() || `Công nợ ${debtType === 'payable' ? 'phải trả' : 'phải thu'} #${Date.now().toString().slice(-4)}`,
      debtType,
      referenceType: 'manual',
      totalAmount: amount,
      paidAmount: 0,
      remainingAmount: amount,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'pending',
      note: note || '',
      createdById: user?._id || null,
    });

    // Cập nhật công nợ trên Supplier
    if (debtType === 'payable') {
      supplier.debt = (supplier.debt || 0) + amount;
    } else {
      supplier.debt = (supplier.debt || 0) - amount;
    }
    await supplier.save();

    return debt;
  }

  /**
   * Thanh toán công nợ (Tạo Phiếu Chi / Phiếu Thu gắn với Kho hàng)
   */
  static async payDebt(supplierId, debtId, payload, user = null) {
    const [supplier, debt] = await Promise.all([
      Supplier.findById(supplierId),
      SupplierDebt.findOne({ _id: debtId, supplierId }),
    ]);

    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 404);
    if (!debt) throw new AppError('Khoản công nợ không tồn tại', 404);

    if (debt.status === 'paid' || debt.remainingAmount <= 0) {
      throw new AppError('Khoản công nợ này đã được thanh toán toàn bộ', 400);
    }

    const payAmount = Number(payload.amount);
    if (!payAmount || payAmount <= 0) {
      throw new AppError('Số tiền thanh toán phải lớn hơn 0', 400);
    }

    if (payAmount > debt.remainingAmount) {
      throw new AppError(
        `Số tiền thanh toán (${payAmount.toLocaleString('vi-VN')}đ) vượt quá số nợ còn lại (${debt.remainingAmount.toLocaleString('vi-VN')}đ)`,
        400
      );
    }

    // Kho hàng phát sinh thanh toán
    let whId = payload.warehouseId || debt.warehouseId;
    if (!whId) {
      const defaultWh = await Warehouse.findOne({ isDefault: true }).select('_id');
      whId = defaultWh?._id;
    }
    if (!whId) throw new AppError('Vui lòng chọn kho hàng phát sinh thanh toán', 400);

    // 1. Cập nhật khoản công nợ
    debt.paidAmount = (debt.paidAmount || 0) + payAmount;
    debt.remainingAmount = Math.max(0, debt.totalAmount - debt.paidAmount);
    debt.status = debt.remainingAmount === 0 ? 'paid' : 'partially_paid';
    await debt.save();

    // 2. Cập nhật dư nợ tổng của nhà cung cấp
    if (debt.debtType === 'payable') {
      supplier.debt = Math.max(0, (supplier.debt || 0) - payAmount);
    } else {
      supplier.debt = (supplier.debt || 0) + payAmount;
    }
    await supplier.save();

    // 3. Tạo phiếu thu/chi (SupplierDebtTransaction)
    const voucherType = payload.voucherType || (debt.debtType === 'payable' ? 'payment' : 'receipt');
    const transaction = await SupplierDebtTransaction.create({
      supplierId,
      debtId: debt._id,
      warehouseId: whId,
      voucherType,
      amount: payAmount,
      balanceAfter: supplier.debt,
      paymentMethod: payload.paymentMethod || 'bank_transfer',
      accountingRecorded: payload.accountingRecorded !== false,
      debtCleared: true,
      description: payload.description || `Thanh toán cho ${debt.name}`,
      note: payload.note || '',
      attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
      createdById: user?._id || null,
    });

    return {
      debt,
      transaction,
      currentSupplierDebt: supplier.debt,
    };
  }

  /**
   * Bù trừ công nợ giữa các khoản Phải thu và Phải trả của nhà cung cấp
   */
  static async offsetDebts(supplierId, user = null) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) throw new AppError('Nhà cung cấp không tồn tại', 404);

    const [payables, receivables] = await Promise.all([
      SupplierDebt.find({ supplierId, debtType: 'payable', status: { $in: ['pending', 'partially_paid'] } }).sort({ createdAt: 1 }),
      SupplierDebt.find({ supplierId, debtType: 'receivable', status: { $in: ['pending', 'partially_paid'] } }).sort({ createdAt: 1 }),
    ]);

    if (!payables.length || !receivables.length) {
      throw new AppError('Không có đủ các khoản phải thu và phải trả để thực hiện bù trừ', 400);
    }

    let pIdx = 0;
    let rIdx = 0;
    let totalOffset = 0;

    while (pIdx < payables.length && rIdx < receivables.length) {
      const p = payables[pIdx];
      const r = receivables[rIdx];

      const offsetAmount = Math.min(p.remainingAmount, r.remainingAmount);

      p.paidAmount += offsetAmount;
      p.remainingAmount -= offsetAmount;
      p.status = p.remainingAmount === 0 ? 'paid' : 'partially_paid';

      r.paidAmount += offsetAmount;
      r.remainingAmount -= offsetAmount;
      r.status = r.remainingAmount === 0 ? 'paid' : 'partially_paid';

      await p.save();
      await r.save();

      totalOffset += offsetAmount;

      if (p.remainingAmount === 0) pIdx++;
      if (r.remainingAmount === 0) rIdx++;
    }

    // Cập nhật lại tổng nợ chính xác
    const summary = await SupplierDebt.aggregate([
      { $match: { supplierId: new mongoose.Types.ObjectId(supplierId), status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$debtType',
          totalRemaining: { $sum: '$remainingAmount' },
        },
      },
    ]);

    let totalPay = 0;
    let totalRec = 0;
    summary.forEach((s) => {
      if (s._id === 'payable') totalPay = s.totalRemaining;
      if (s._id === 'receivable') totalRec = s.totalRemaining;
    });

    supplier.debt = Math.max(0, totalPay - totalRec);
    await supplier.save();

    return {
      success: true,
      message: `Đã bù trừ công nợ thành công số tiền ${totalOffset.toLocaleString('vi-VN')}đ`,
      totalOffset,
      currentSupplierDebt: supplier.debt,
    };
  }

  /**
   * Lấy lịch sử biến động công nợ / phiếu thu chi
   */
  static async getDebtHistory(supplierId, query = {}) {
    const { page = 1, limit = 50 } = query;
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      SupplierDebtTransaction.find({ supplierId })
        .populate('warehouseId', 'name code isDefault')
        .populate('debtId', 'debtNumber name debtType')
        .populate('createdById', 'fullName name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      SupplierDebtTransaction.countDocuments({ supplierId }),
    ]);

    return {
      transactions,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  /**
   * Tự động sinh công nợ từ Đơn Nhập Hàng (Purchase Order) khi tạo / nhập kho
   */
  static async syncFromPurchaseOrder(po) {
    if (!po || !po.supplierId || !po.totalAmount) return;

    try {
      const existing = await SupplierDebt.findOne({
        referenceType: 'purchase_order',
        referenceId: po._id,
      });

      if (!existing) {
        await SupplierDebt.create({
          supplierId: po.supplierId,
          warehouseId: po.warehouseId || null,
          name: `Đơn nhập hàng #${po.poNumber || po._id.toString().slice(-6).toUpperCase()}`,
          debtType: 'payable',
          referenceType: 'purchase_order',
          referenceId: po._id,
          referenceModel: 'PurchaseOrder',
          referenceCode: po.poNumber || '',
          totalAmount: po.totalAmount,
          paidAmount: 0,
          remainingAmount: po.totalAmount,
          dueDate: po.deliveryDate || null,
          status: 'pending',
          note: po.note || '',
          createdById: po.createdById || null,
        });

        // Tăng công nợ & tổng mua cho nhà cung cấp
        await Supplier.findByIdAndUpdate(po.supplierId, {
          $inc: {
            debt: po.totalAmount,
            totalPurchase: po.totalAmount,
          },
        });
      }
    } catch (err) {
      console.error('Error syncing supplier debt from PO:', err.message);
    }
  }

  /**
   * Tự động giảm trừ công nợ khi có Đơn Trả Hàng Nhập (Purchase Return)
   */
  static async syncFromPurchaseReturn(pr) {
    if (!pr || !pr.supplierId || !pr.totalAmount) return;

    try {
      const existing = await SupplierDebt.findOne({
        referenceType: 'purchase_return',
        referenceId: pr._id,
      });

      if (!existing) {
        await SupplierDebt.create({
          supplierId: pr.supplierId,
          warehouseId: null,
          name: `Trả hàng đơn nhập #${pr.returnNumber || pr._id.toString().slice(-6).toUpperCase()}`,
          debtType: 'receivable',
          referenceType: 'purchase_return',
          referenceId: pr._id,
          referenceModel: 'PurchaseReturn',
          referenceCode: pr.returnNumber || '',
          totalAmount: pr.totalAmount,
          paidAmount: 0,
          remainingAmount: pr.totalAmount,
          status: 'pending',
          note: pr.note || 'Xuất trả hàng nhà cung cấp',
          createdById: pr.createdById || null,
        });

        // Giảm công nợ nhà cung cấp
        await Supplier.findByIdAndUpdate(pr.supplierId, {
          $inc: {
            debt: -pr.totalAmount,
          },
        });
      }
    } catch (err) {
      console.error('Error syncing supplier debt from Purchase Return:', err.message);
    }
  }

  /**
   * Đồng bộ toàn bộ dữ liệu lịch sử từ PurchaseOrder & PurchaseReturn vào SupplierDebt & Supplier.debt
   */
  static async syncAllExistingOrders() {
    const PurchaseOrder = require('../models/purchaseOrder.model');
    const PurchaseReturn = require('../models/purchaseReturn.model');

    const [pos, prs, suppliers] = await Promise.all([
      PurchaseOrder.find({}),
      PurchaseReturn.find({}),
      Supplier.find({}),
    ]);

    console.log(`[SyncDebt] Found ${pos.length} POs, ${prs.length} PRs, ${suppliers.length} suppliers in DB.`);

    // Build supplier maps by _id and by clean name
    const supplierById = new Map();
    const supplierByName = new Map();
    suppliers.forEach((s) => {
      supplierById.set(s._id.toString(), s);
      if (s.name) supplierByName.set(s.name.trim().toLowerCase(), s);
    });

    let syncedOrdersCount = 0;
    let syncedReturnsCount = 0;

    // 1. Đồng bộ từng đơn nhập hàng (PO)
    for (const po of pos) {
      if (!po.totalAmount) continue;

      let targetSupplier = null;
      const rawSupId = po.supplierId?._id ? po.supplierId._id.toString() : (po.supplierId ? po.supplierId.toString() : null);

      if (rawSupId && supplierById.has(rawSupId)) {
        targetSupplier = supplierById.get(rawSupId);
      } else {
        // Try populate / match by name
        const populatedPo = await PurchaseOrder.findById(po._id).populate('supplierId').lean();
        const poSupName = populatedPo?.supplierId?.name || populatedPo?.supplierName;
        if (poSupName && supplierByName.has(poSupName.trim().toLowerCase())) {
          targetSupplier = supplierByName.get(poSupName.trim().toLowerCase());
          // Cập nhật lại supplierId chuẩn cho PO
          await PurchaseOrder.updateOne({ _id: po._id }, { $set: { supplierId: targetSupplier._id } });
        }
      }

      if (!targetSupplier) continue;

      const existing = await SupplierDebt.findOne({
        referenceType: 'purchase_order',
        referenceId: po._id,
      });

      if (!existing) {
        await SupplierDebt.create({
          supplierId: targetSupplier._id,
          warehouseId: po.warehouseId || null,
          name: `Đơn nhập hàng #${po.poNumber || po._id.toString().slice(-6).toUpperCase()}`,
          debtType: 'payable',
          referenceType: 'purchase_order',
          referenceId: po._id,
          referenceModel: 'PurchaseOrder',
          referenceCode: po.poNumber || '',
          totalAmount: po.totalAmount,
          paidAmount: 0,
          remainingAmount: po.totalAmount,
          dueDate: po.deliveryDate || null,
          status: 'pending',
          note: po.note || '',
          createdById: po.createdById || null,
          createdAt: po.createdAt || new Date(),
        });
        syncedOrdersCount++;
      }
    }

    // 2. Đồng bộ từng đơn trả hàng nhập (PR)
    for (const pr of prs) {
      if (!pr.totalAmount) continue;

      let targetSupplier = null;
      const rawSupId = pr.supplierId?._id ? pr.supplierId._id.toString() : (pr.supplierId ? pr.supplierId.toString() : null);
      if (rawSupId && supplierById.has(rawSupId)) {
        targetSupplier = supplierById.get(rawSupId);
      } else if (pr.supplierName && supplierByName.has(pr.supplierName.trim().toLowerCase())) {
        targetSupplier = supplierByName.get(pr.supplierName.trim().toLowerCase());
      }

      if (!targetSupplier) continue;

      const existing = await SupplierDebt.findOne({
        referenceType: 'purchase_return',
        referenceId: pr._id,
      });

      if (!existing) {
        await SupplierDebt.create({
          supplierId: targetSupplier._id,
          warehouseId: null,
          name: `Trả hàng đơn nhập #${pr.returnNumber || pr._id.toString().slice(-6).toUpperCase()}`,
          debtType: 'receivable',
          referenceType: 'purchase_return',
          referenceId: pr._id,
          referenceModel: 'PurchaseReturn',
          referenceCode: pr.returnNumber || '',
          totalAmount: pr.totalAmount,
          paidAmount: 0,
          remainingAmount: pr.totalAmount,
          status: 'pending',
          note: pr.note || 'Xuất trả hàng nhà cung cấp',
          createdById: pr.createdById || null,
          createdAt: pr.createdAt || new Date(),
        });
        syncedReturnsCount++;
      }
    }

    // 3. Tính toán lại chính xác tổng mua & tổng công nợ cho toàn bộ nhà cung cấp
    let updatedSuppliersCount = 0;
    for (const sup of suppliers) {
      const [supplierPOs, debts] = await Promise.all([
        PurchaseOrder.find({
          $or: [
            { supplierId: sup._id },
            { supplierId: sup._id.toString() },
          ],
        }),
        SupplierDebt.find({
          $or: [
            { supplierId: sup._id },
            { supplierId: sup._id.toString() },
          ],
          status: { $ne: 'cancelled' },
        }),
      ]);

      const totalPurchase = supplierPOs.reduce((acc, cur) => acc + (cur.totalAmount || 0), 0);

      let totalPayableRemaining = 0;
      let totalReceivableRemaining = 0;

      debts.forEach((d) => {
        if (d.debtType === 'payable') {
          totalPayableRemaining += d.remainingAmount || 0;
        } else if (d.debtType === 'receivable') {
          totalReceivableRemaining += d.remainingAmount || 0;
        }
      });

      const netDebt = Math.max(0, totalPayableRemaining - totalReceivableRemaining);

      await Supplier.updateOne(
        { _id: sup._id },
        {
          $set: {
            totalPurchase,
            debt: netDebt,
          },
        }
      );
      updatedSuppliersCount++;
    }

    return {
      success: true,
      syncedOrdersCount,
      syncedReturnsCount,
      updatedSuppliersCount,
      message: `Đã đồng bộ thành công ${syncedOrdersCount} đơn nhập, ${syncedReturnsCount} đơn trả hàng, và cập nhật số dư cho ${updatedSuppliersCount} nhà cung cấp.`,
    };
  }
}

module.exports = SupplierDebtService;
