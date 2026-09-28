const PurchaseOrderService = require('../services/purchaseOrder.service');
const { recordAuditLog } = require('../services/auditLog.service');

const getPurchaseOrders = async (req, res, next) => {
  try {
    const result = await PurchaseOrderService.getPurchaseOrders(req.query);
    res.json({ status: 'success', data: result.data, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
};

const getPurchaseOrderById = async (req, res, next) => {
  try {
    const data = await PurchaseOrderService.getPurchaseOrderById(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const data = await PurchaseOrderService.createPurchaseOrder(req.body, req.user._id);

    // Ghi audit log khi tạo đơn nhập kho
    recordAuditLog({
      req,
      user: req.user,
      action: 'CREATE',
      module: 'PURCHASE_ORDER',
      targetId: data._id,
      targetName: data.poNumber,
      newData: data.toObject ? data.toObject() : data,
    }).catch(() => {});

    res.status(201).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    // Snapshot trước khi update để ghi diff
    const before = await PurchaseOrderService.getPurchaseOrderById(req.params.id);
    const data = await PurchaseOrderService.updatePurchaseOrderStatus(
      req.params.id,
      req.body,
      req.user._id
    );

    // Ghi audit log khi cập nhật trạng thái (đặc biệt khi completed)
    recordAuditLog({
      req,
      user: req.user,
      action: 'UPDATE',
      module: 'PURCHASE_ORDER',
      targetId: data._id,
      targetName: `${data.poNumber} → ${data.status}`,
      oldData: before.toObject ? before.toObject() : before,
      newData: data.toObject ? data.toObject() : data,
    }).catch(() => {});

    res.json({ status: 'success', data, message: 'Cập nhật trạng thái đơn nhập kho thành công' });
  } catch (err) {
    next(err);
  }
};

const downloadExcelSlip = async (req, res, next) => {
  try {
    const { workbook, poNumber } = await PurchaseOrderService.generateExcelSlip(req.params.id);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Phieu_Nhap_Kho_${poNumber}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

const previewExcelSlip = async (req, res, next) => {
  try {
    const tempPO = await PurchaseOrderService.createPurchaseOrder(
      { ...req.body, status: 'draft' },
      req.user._id
    );
    const { workbook } = await PurchaseOrderService.generateExcelSlip(tempPO._id);
    const PurchaseOrderModel = require('../models/purchaseOrder.model');
    await PurchaseOrderModel.findByIdAndDelete(tempPO._id);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

const previewPOEmail = async (req, res, next) => {
  try {
    const data = await PurchaseOrderService.previewPOEmail(req.params.id);
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

const sendPOToSupplier = async (req, res, next) => {
  try {
    const data = await PurchaseOrderService.sendPOToSupplier(req.params.id, req.body, req.user._id);

    // Ghi audit log khi gửi PO cho NCC
    recordAuditLog({
      req,
      user: req.user,
      action: 'UPDATE',
      module: 'PURCHASE_ORDER',
      targetId: data._id,
      targetName: `${data.poNumber} — Đã gửi NCC`,
    }).catch(() => {});

    res.json({ status: 'success', data, message: 'Đã gửi PO tới nhà cung cấp thành công' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  downloadExcelSlip,
  previewExcelSlip,
  previewPOEmail,
  sendPOToSupplier,
};

