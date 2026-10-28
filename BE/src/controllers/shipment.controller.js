const ShipmentService = require('../services/shipment.service');
const catchAsync = require('../utils/catchAsync');

// 1. Thống kê tổng quan vận chuyển
const getOverview = catchAsync(async (req, res) => {
  const result = await ShipmentService.getOverview(req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// 2. Danh sách vận đơn
const getShipmentsList = catchAsync(async (req, res) => {
  const result = await ShipmentService.getShipmentsList(req.query);
  res.status(200).json({
    success: true,
    data: result.shipments,
    pagination: result.pagination,
  });
});

// 3. Chi tiết 1 vận đơn
const getShipmentById = catchAsync(async (req, res) => {
  const result = await ShipmentService.getShipmentById(req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// 4. Danh sách đơn hàng đủ điều kiện tạo vận đơn
const getEligibleOrders = catchAsync(async (req, res) => {
  const orders = await ShipmentService.getEligibleOrders();
  res.status(200).json({
    success: true,
    data: orders,
  });
});

// 5. Tạo mới vận đơn
const createShipment = catchAsync(async (req, res) => {
  const result = await ShipmentService.createShipment(req.body, req.user, req);
  res.status(201).json({
    success: true,
    message: `Đã tạo phiếu giao hàng ${result.shipmentCode} qua ${result.carrierName} thành công!`,
    data: result,
  });
});

// 6. Hủy vận đơn
const cancelShipment = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const result = await ShipmentService.cancelShipment(req.params.id, reason, req.user, req);
  res.status(200).json({
    success: true,
    message: `Đã hủy phiếu giao hàng ${result.shipmentCode} thành công!`,
    data: result,
  });
});

// 7. Cập nhật trạng thái vận đơn
const updateShipmentStatus = catchAsync(async (req, res) => {
  const { status, note } = req.body;
  const result = await ShipmentService.updateStatus(req.params.id, status, note, req.user);
  res.status(200).json({
    success: true,
    message: `Đã cập nhật trạng thái vận đơn thành: ${result.statusText}`,
    data: result,
  });
});

// 8. Đồng bộ trạng thái từ API hãng vận chuyển
const syncShipmentStatus = catchAsync(async (req, res) => {
  const result = await ShipmentService.syncShipmentStatus(req.params.id, req.user, req);
  res.status(200).json({
    success: true,
    message: `Đã đồng bộ trạng thái từ ${result.carrierName}: [${result.statusText}]`,
    data: result,
  });
});

// 9. Tiếp nhận Webhook callback từ hãng vận chuyển
const handleCarrierWebhook = catchAsync(async (req, res) => {
  const result = await ShipmentService.handleCarrierWebhook(req.params.carrier, req.body, req.headers);
  res.status(200).json(result);
});

// 10. Tra cứu vận đơn theo mã đơn hàng
const getShipmentByOrderCode = catchAsync(async (req, res) => {
  const result = await ShipmentService.getShipmentByOrderCode(req.params.orderCode);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// 11. Tra cứu nhiều vận đơn theo danh sách mã đơn hàng (Admin)
const getShipmentsByOrderCodes = catchAsync(async (req, res) => {
  const codesParam = req.query.codes;
  const orderCodes = typeof codesParam === 'string'
    ? codesParam.split(',').map((c) => c.trim()).filter(Boolean)
    : (req.body?.orderCodes || []);
  const result = await ShipmentService.getShipmentsByOrderCodes(orderCodes);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// 12. Thống kê đối soát tiền COD
const getCODStats = catchAsync(async (req, res) => {
  const stats = await ShipmentService.getCODReconciliationStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

// 13. Xác nhận đối soát COD cho 1 vận đơn
const reconcileShipmentCOD = catchAsync(async (req, res) => {
  const result = await ShipmentService.reconcileShipmentCOD(req.params.id, {
    ...req.body,
    user: req.user,
  });
  res.status(200).json({
    success: true,
    message: 'Đối soát tiền COD thành công!',
    data: result,
  });
});

// 14. Xác nhận đối soát COD hàng loạt
const bulkReconcileCOD = catchAsync(async (req, res) => {
  const result = await ShipmentService.bulkReconcileCOD({
    ...req.body,
    user: req.user,
  });
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

// 15. Tải / Xem trước file Excel phiếu giao hàng / vận đơn
const downloadExcelSlip = async (req, res, next) => {
  try {
    const { workbook, shipmentCode, trackingCode } = await ShipmentService.generateExcelSlip(req.params.id);

    const filename = `Phieu_Giao_Hang_${shipmentCode || trackingCode || 'Van_Don'}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('[Shipment] Lỗi xuất file Excel:', err);
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
};

module.exports = {
  getOverview,
  getShipmentsList,
  getShipmentById,
  getShipmentByOrderCode,
  getShipmentsByOrderCodes,
  getEligibleOrders,
  createShipment,
  cancelShipment,
  updateShipmentStatus,
  syncShipmentStatus,
  handleCarrierWebhook,
  getCODStats,
  reconcileShipmentCOD,
  bulkReconcileCOD,
  downloadExcelSlip,
};


