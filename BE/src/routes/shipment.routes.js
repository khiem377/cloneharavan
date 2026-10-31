const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/shipment.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Tuyến đường nhận Webhook từ hãng vận chuyển (Công khai, không qua protect JWT)
router.post('/webhooks/:carrier', handleCarrierWebhook);

router.use(protect);

// Dev tiện ích: Chạy script fix đơn hàng test & master data sản phẩm (Admin Only)
router.get('/dev-fix-test-orders', requirePermission('setting.manage'), async (req, res) => {
  try {
    const { runFix } = require('../../scripts/fix_test_orders_products');
    const result = await runFix();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dev tiện ích: Đồng bộ lại thông tin khách hàng, sản phẩm và tổng tiền cho các phiếu xuất kho (Admin Only)
router.get('/dev-fix-stock-exports', requirePermission('setting.manage'), async (req, res) => {
  try {
    const StockExport = require('../models/stockExport.model');
    const exportsList = await StockExport.find().sort({ createdAt: -1 }).limit(5).lean();
    res.json({ success: true, count: exportsList.length, exportsList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 1. Thống kê tổng quan vận chuyển
router.get('/overview', requirePermission(['order.view', 'order.manage', 'setting.view']), getOverview);

// 2. Danh sách đơn hàng chờ tạo vận đơn
router.get('/eligible-orders', requirePermission(['order.view', 'order.manage']), getEligibleOrders);

// 3. Danh sách vận đơn
router.get('/', requirePermission(['order.view', 'order.manage', 'setting.view']), getShipmentsList);

// 4.0 Tra cứu nhiều vận đơn theo danh sách mã đơn hàng (Admin bảng đơn hàng)
router.get('/by-orders', requirePermission(['order.view', 'order.manage', 'setting.view']), getShipmentsByOrderCodes);

// 4.1 Tra cứu vận đơn theo mã đơn hàng (Khách hàng sở hữu đơn & Admin hệ thống)
router.get('/by-order/:orderCode', getShipmentByOrderCode);

// 4.2 Thống kê đối soát tiền COD
router.get('/cod/stats', requirePermission(['order.view', 'order.manage', 'setting.view']), getCODStats);

// 4.3 Xác nhận đối soát COD hàng loạt
router.post('/cod/bulk-reconcile', requirePermission(['order.manage', 'setting.manage']), bulkReconcileCOD);

// 4.5 Tải / Xem trước phiếu giao hàng Excel theo mẫu chuẩn
router.get('/:id/download-excel', requirePermission(['order.view', 'order.manage', 'setting.view']), downloadExcelSlip);

// 4. Chi tiết 1 vận đơn
router.get('/:id', requirePermission(['order.view', 'order.manage', 'setting.view']), getShipmentById);

// 4.4 Xác nhận đối soát COD cho 1 vận đơn
router.post('/:id/reconcile-cod', requirePermission(['order.manage', 'setting.manage']), reconcileShipmentCOD);

// 5. Tạo mới vận đơn
router.post('/', requirePermission(['order.manage', 'setting.manage']), createShipment);

// 6. Hủy vận đơn
router.post('/:id/cancel', requirePermission(['order.manage', 'setting.manage']), cancelShipment);

// 7. Cập nhật trạng thái vận đơn thủ công
router.put('/:id/status', requirePermission(['order.manage', 'setting.manage']), updateShipmentStatus);

// 8. Đồng bộ trạng thái trực tiếp từ API hãng (GHN, Viettel Post, ...)
router.post('/:id/sync', requirePermission(['order.manage', 'setting.manage']), syncShipmentStatus);

module.exports = router;

