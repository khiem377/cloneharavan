export const PAYMENT_MODAL_CONFIG = {
  vnpay: {
    title: 'Kết nối Cổng thanh toán VNPAY-QR',
    notice: 'Môi trường hỗ trợ: Sandbox (sandbox.vnpayment.vn) & Production (vnpayment.vn)',
    fields: [
      {
        key: 'tmnCode',
        label: 'Mã Website (TMN Code)*',
        type: 'text',
        placeholder: 'Nhập mã Website TMN Code do VNPAY cấp (VD: 2QXUI4J4)...',
        required: true,
        fullWidth: true,
      },
      {
        key: 'hashSecret',
        label: 'Chuỗi bí mật (Hash Secret / Checksum)*',
        type: 'password',
        placeholder: 'Nhập khóa bí mật HMAC-SHA512...',
        required: true,
        fullWidth: true,
      },
    ],
    links: [
      { label: 'Cổng Merchant VNPAY', url: 'https://sandbox.vnpayment.vn/merchantv2/' },
      { label: 'Tài liệu tích hợp VNPAY Sandbox', url: 'https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/' },
    ],
  },
  momo: {
    title: 'Kết nối Ví điện tử & Cổng MoMo',
    notice: 'Môi trường hỗ trợ: MoMo Test Environment & MoMo Production',
    fields: [
      {
        key: 'partnerCode',
        label: 'Mã đối tác (Partner Code)*',
        type: 'text',
        placeholder: 'Nhập Partner Code (VD: MOMOBKUN20180529)...',
        required: true,
        fullWidth: true,
      },
      {
        key: 'accessKey',
        label: 'Khóa truy cập (Access Key)*',
        type: 'text',
        placeholder: 'Nhập Access Key...',
        required: true,
      },
      {
        key: 'secretKey',
        label: 'Khóa bí mật chữ ký (Secret Key)*',
        type: 'password',
        placeholder: 'Nhập Secret Key HMAC-SHA256...',
        required: true,
      },
    ],
    links: [
      { label: 'Cổng MoMo Business Portal', url: 'https://business.momo.vn/' },
      { label: 'Tài liệu kỹ thuật MoMo Developers', url: 'https://developers.momo.vn/' },
    ],
  },
  zalopay: {
    title: 'Kết nối Cổng thanh toán ZaloPay',
    notice: 'Môi trường hỗ trợ: ZaloPay Sandbox & Production Gateway',
    fields: [
      {
        key: 'appId',
        label: 'Mã ứng dụng (App ID)*',
        type: 'text',
        placeholder: 'Nhập App ID cấp từ ZaloPay (VD: 2553 hoặc 554)...',
        required: true,
        fullWidth: true,
      },
      {
        key: 'key1',
        label: 'Key 1 (Mac Key tạo đơn)*',
        type: 'password',
        placeholder: 'Nhập Key 1 tạo chữ ký đơn hàng...',
        required: true,
      },
      {
        key: 'key2',
        label: 'Key 2 (Callback Key xác thực)*',
        type: 'password',
        placeholder: 'Nhập Key 2 xác thực Webhook/IPN...',
        required: true,
      },
    ],
    links: [
      { label: 'Cổng ZaloPay Merchant Portal', url: 'https://merchant.zalopay.vn/' },
      { label: 'Tài liệu tích hợp ZaloPay Sandbox', url: 'https://docs.zalopay.vn/' },
    ],
  },
  onepay: {
    title: 'Kết nối Cổng thanh toán OnePay',
    notice: 'Môi trường hỗ trợ: Sandbox (mtf.onepay.vn) & Production (onepay.vn)',
    fields: [
      {
        key: 'merchantId',
        label: 'Mã đơn vị (Merchant ID)*',
        type: 'text',
        placeholder: 'Nhập Merchant ID...',
        required: true,
        fullWidth: true,
      },
      {
        key: 'accessCode',
        label: 'Mã truy cập (Access Code)*',
        type: 'text',
        placeholder: 'Nhập Access Code...',
        required: true,
      },
      {
        key: 'secureSecret',
        label: 'Khóa bí mật băm (Secure Secret)*',
        type: 'password',
        placeholder: 'Nhập khóa bí mật HMAC-SHA256...',
        required: true,
      },
    ],
    links: [
      { label: 'Cổng thanh toán Sandbox OnePay', url: 'https://mtf.onepay.vn' },
      { label: 'Trang chủ OnePay Việt Nam', url: 'https://www.onepay.vn' },
    ],
  },
};
