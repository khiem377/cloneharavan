const mongoose = require('mongoose');

const storeSettingSchema = new mongoose.Schema(
  {
    // Đánh dấu bản ghi cấu hình chính (Singleton)
    isDefault: {
      type: Boolean,
      default: true,
      unique: true,
    },

    // 1. CẤU HÌNH THÔNG TIN CỬA HÀNG
    storeInfo: {
      name: {
        type: String,
        default: 'Dak Shop',
        trim: true,
      },
      businessName: {
        type: String,
        default: 'Công ty Cổ phần Dak Shop Việt Nam',
        trim: true,
      },
      logo: {
        type: String,
        default: '',
      },
      favicon: {
        type: String,
        default: '',
      },
      hotline: {
        type: String,
        default: '1900 1234',
        trim: true,
      },
      phone: {
        type: String,
        default: '0949527013',
        trim: true,
      },
      adminEmail: {
        type: String,
        default: 'admin@dakshop.vn',
        trim: true,
      },
      supportEmail: {
        type: String,
        default: 'support@dakshop.vn',
        trim: true,
      },
      logoMediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: null,
      },
      businessType: {
        type: String,
        default: 'Chưa xác định',
      },
      industry: {
        type: String,
        default: 'Thời trang & Phụ kiện',
      },
      description: {
        type: String,
        default: 'Chuyên cung cấp các thiết bị điện tử, thời trang và sản phẩm chính hãng chất lượng cao.',
        trim: true,
      },
      socialLinks: {
        facebook: { type: String, default: 'https://www.facebook.com/' },
        youtube: { type: String, default: 'https://www.youtube.com/' },
        tiktok: { type: String, default: 'https://www.tiktok.com/' },
        instagram: { type: String, default: 'https://www.instagram.com/' },
        zalo: { type: String, default: 'https://zalo.me/' },
      },
      address: {
        street: { type: String, default: '123 Đường Nguyễn Huệ' },
        ward: { type: String, default: 'Bến Nghé' },
        wardCode: { type: String, default: '' },
        district: { type: String, default: 'Quận 1' },
        districtId: { type: Number, default: null },
        province: { type: String, default: 'Hồ Chí Minh' },
        provinceId: { type: Number, default: null },
        fullAddress: { type: String, default: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh' },
      },
    },

    // 2. TIÊU CHUẨN VÀ ĐỊNH DẠNG
    standards: {
      currency: {
        type: String,
        default: 'VND',
        enum: ['VND', 'USD'],
      },
      hasDecimal: {
        type: Boolean,
        default: false,
      },
      weightUnit: {
        type: String,
        default: 'gram',
        enum: ['gram', 'kg'],
      },
      timezone: {
        type: String,
        default: 'GMT+07:00',
      },
      numberFormat: {
        type: String,
        default: 'vi-VN',
      },
    },

    // 3. ĐỊNH DẠNG MÃ ĐƠN HÀNG
    orderCode: {
      prefix: {
        type: String,
        default: '#',
        trim: true,
      },
      suffix: {
        type: String,
        default: '',
        trim: true,
      },
      currentNumber: {
        type: Number,
        default: 1000,
      },
    },

    // 4. CẤU HÌNH TRANG THANH TOÁN (CHECKOUT)
    checkout: {
      // Kiểu hiển thị trang thanh toán: 'one_step' (1 bước) hoặc 'three_step' (3 bước)
      layoutType: {
        type: String,
        enum: ['one_step', 'three_step'],
        default: 'one_step',
      },
      // Quy định tài khoản khách: 'disabled', 'optional', 'required'
      customerAccount: {
        type: String,
        enum: ['disabled', 'optional', 'required'],
        default: 'optional',
      },
      // Ma trận trường thông tin thanh toán: ['hidden', 'optional', 'required']
      fieldMatrix: {
        phone: {
          type: String,
          enum: ['hidden', 'optional', 'required'],
          default: 'required',
        },
        email: {
          type: String,
          enum: ['hidden', 'optional', 'required'],
          default: 'required',
        },
        address: {
          type: String,
          enum: ['hidden', 'optional', 'required'],
          default: 'required',
        },
        district: {
          type: String,
          enum: ['hidden', 'optional', 'required'],
          default: 'required',
        },
        ward: {
          type: String,
          enum: ['hidden', 'optional', 'required'],
          default: 'required',
        },
      },
      // Tùy chọn bổ trợ
      useTwoLevelAddress: {
        type: Boolean,
        default: false,
      },
      allowDifferentShippingAddress: {
        type: Boolean,
        default: true,
      },
      allowCompanyInvoice: {
        type: Boolean,
        default: true,
      },
      autoSuggestAddress: {
        type: Boolean,
        default: true,
      },
      // Thông báo thêm & reCaptcha
      extraNotice: {
        type: String,
        default: '',
      },
      enableReCaptcha: {
        type: Boolean,
        default: false,
      },
      // Nội dung chân trang thanh toán
      footerContent: {
        type: String,
        default: '',
      },
      // Ngôn ngữ trang thanh toán
      language: {
        type: String,
        default: 'vi',
      },
      // Các chính sách pháp lý
      policies: {
        refundPolicy: {
          type: String,
          default: '',
        },
        privacyPolicy: {
          type: String,
          default: '',
        },
        termsOfService: {
          type: String,
          default: '',
        },
      },
    },

    // 5. CẤU HÌNH VẬN CHUYỂN
    shipping: {
      // Khối lượng: 'product' (theo sản phẩm trong đơn) hoặc 'custom' (tùy chỉnh cố định)
      weightType: {
        type: String,
        enum: ['product', 'custom'],
        default: 'product',
      },
      customWeight: {
        type: Number,
        default: 500, // gram
      },
      // Kích thước mặc định kiện hàng (cm)
      length: {
        type: Number,
        default: 10,
      },
      width: {
        type: Number,
        default: 10,
      },
      height: {
        type: Number,
        default: 10,
      },
      // Yêu cầu khi giao hàng: 'allow_check_no_try', 'allow_try', 'no_check'
      deliveryRequirement: {
        type: String,
        enum: ['allow_check_no_try', 'allow_try', 'no_check'],
        default: 'allow_check_no_try',
      },
      // Người thanh toán cước: 'shop' (Shop trả), 'customer' (Khách hàng trả)
      shippingPayer: {
        type: String,
        enum: ['shop', 'customer'],
        default: 'customer',
      },
      // Ghi chú giao hàng mặc định (tối đa 255 ký tự)
      defaultNote: {
        type: String,
        default: 'Cho xem hàng không cho thử. Hàng dễ vỡ xin nhẹ tay.',
        maxlength: 255,
      },
      // Tự động đồng bộ
      syncOrderNote: {
        type: Boolean,
        default: true,
      },
      syncReturnedStatus: {
        type: Boolean,
        default: false,
      },
      syncCancelledStatus: {
        type: Boolean,
        default: true,
      },
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Đảm bảo luôn lấy được bản ghi cài đặt mặc định
storeSettingSchema.statics.getSingleton = async function () {
  let setting = await this.findOne({ isDefault: true });
  if (!setting) {
    setting = await this.create({ isDefault: true });
  } else if (!setting.storeInfo?.name || setting.storeInfo?.name === 'Cửa hàng PosDemo') {
    setting.storeInfo = setting.storeInfo || {};
    setting.storeInfo.name = 'Dak Shop';
    setting.storeInfo.businessName = 'Công ty Cổ phần Dak Shop Việt Nam';
    await setting.save();
  }
  return setting;
};

module.exports = mongoose.model('StoreSetting', storeSettingSchema);
