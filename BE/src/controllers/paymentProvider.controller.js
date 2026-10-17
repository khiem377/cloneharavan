const catchAsync = require('../utils/catchAsync');
const paymentProviderService = require('../services/paymentProvider.service');

// Lấy toàn bộ danh sách cổng thanh toán cho Admin
const getProviders = catchAsync(async (req, res) => {
  const providers = await paymentProviderService.getProviders();
  res.status(200).json({
    success: true,
    data: providers,
  });
});

// Kết nối cổng thanh toán (nhập keys/credentials và chọn môi trường)
const connectProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await paymentProviderService.connectProvider(
    code,
    req.body,
    req.user?._id
  );
  res.status(200).json({
    success: true,
    message: `Kết nối thành công cổng thanh toán ${result.name}`,
    data: result,
  });
});

// Bật / tắt hiển thị cổng thanh toán tại trang Checkout (toggle riêng biệt với connect)
const toggleEnable = catchAsync(async (req, res) => {
  const { code } = req.params;
  const { isEnabled } = req.body;
  const result = await paymentProviderService.toggleEnable(
    code,
    isEnabled,
    req.user?._id
  );
  res.status(200).json({
    success: true,
    message: result.isEnabled
      ? `Đã kích hoạt hiển thị ${result.name} tại trang thanh toán`
      : `Đã tắt hiển thị ${result.name} tại trang thanh toán`,
    data: result,
  });
});

// Ngắt kết nối cổng thanh toán (Xóa keys, chuyển sang disconnected và tắt checkout)
const disconnectProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await paymentProviderService.disconnectProvider(
    code,
    req.user?._id
  );
  res.status(200).json({
    success: true,
    message: `Đã ngắt kết nối cổng thanh toán ${result.name}`,
    data: result,
  });
});

// Lấy danh sách các phương thức thanh toán đang kích hoạt cho Checkout (Public)
const getActiveProvidersForCheckout = catchAsync(async (req, res) => {
  const activeProviders = await paymentProviderService.getActiveProvidersForCheckout();
  res.status(200).json({
    success: true,
    data: activeProviders,
  });
});

// Kiểm tra handshake cổng thanh toán
const testProvider = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await paymentProviderService.testProviderHandshake(code);
  res.status(200).json({
    success: true,
    message: result.message || 'Kiểm tra thông số kết nối thành công',
  });
});

module.exports = {
  getProviders,
  connectProvider,
  toggleEnable,
  disconnectProvider,
  getActiveProvidersForCheckout,
  testProvider,
};
