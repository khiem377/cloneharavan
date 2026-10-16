const catchAsync = require('../utils/catchAsync');
const StoreSettingService = require('../services/storeSetting.service');

// Lấy toàn bộ cấu hình cho Admin
const getStoreSettings = catchAsync(async (req, res) => {
  const settings = await StoreSettingService.getStoreSettings();
  res.status(200).json({
    success: true,
    data: settings,
  });
});

// Lấy cấu hình công khai (Public) cho Storefront & Checkout
const getPublicStoreSettings = catchAsync(async (req, res) => {
  const publicSettings = await StoreSettingService.getPublicStoreSettings();
  res.status(200).json({
    success: true,
    data: publicSettings,
  });
});

// Cập nhật từng phân hệ cấu hình
const updateStoreSettings = catchAsync(async (req, res) => {
  const { section } = req.params;
  const updated = await StoreSettingService.updateStoreSettings(section, req.body, req.user, req);
  res.status(200).json({
    success: true,
    message: `Cập nhật cấu hình ${section} thành công`,
    data: updated,
  });
});

// Lấy danh sách đối tác vận chuyển
const getShippingProviders = catchAsync(async (req, res) => {
  const providers = await StoreSettingService.getShippingProviders();
  res.status(200).json({
    success: true,
    data: providers,
  });
});

// Kết nối đối tác vận chuyển
const connectShippingProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await StoreSettingService.connectShippingProvider(code, req.body, req.user, req);
  res.status(200).json({
    success: true,
    message: `Kết nối đối tác ${result.name} thành công`,
    data: result,
  });
});

// Ngắt kết nối đối tác vận chuyển
const disconnectShippingProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await StoreSettingService.disconnectShippingProvider(code, req.user, req);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// Kiểm tra handshake đối tác vận chuyển
const testShippingProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await StoreSettingService.testShippingProvider(code);
  res.status(200).json({
    success: result.success,
    message: result.message,
  });
});

module.exports = {
  getStoreSettings,
  getPublicStoreSettings,
  updateStoreSettings,
  getShippingProviders,
  connectShippingProvider,
  disconnectShippingProvider,
  testShippingProvider,
};
