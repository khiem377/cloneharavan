const mongoose = require('mongoose');
const argon2   = require('argon2');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

const userSchema = new mongoose.Schema(
  {
    // =========================
    // THÔNG TIN CƠ BẢN
    // =========================
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    phone: {
      type: String,
      sparse: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    tiktokId: {
      type: String,
      sparse: true,
      unique: true,
    },

    zaloId: {
      type: String,
      sparse: true,
      unique: true,
    },

    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'tiktok', 'zalo'],
      default: 'local',
    },

    zaloName: {
      type: String,
      default: null,
    },

    tiktokUsername: {
      type: String,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    // =========================
    // EMAIL
    // =========================
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // PASSWORD
    // =========================
    password: {
      type: String,
      select: false,
    },

    // =========================
    // ĐỊA CHỈ GIAO HÀNG
    // =========================
    addresses: [
      {
        fullName: {
          type: String,
          required: true,
          trim: true,
        },

        phone: {
          type: String,
          required: true,
          trim: true,
        },

        province: {
          type: String,
          required: true,
          trim: true,
        },

        provinceId: {
          type: Number,
          default: null,
        },

        district: {
          type: String,
          required: true,
          trim: true,
        },

        districtId: {
          type: Number,
          default: null,
        },

        ward: {
          type: String,
          required: true,
          trim: true,
        },

        wardCode: {
          type: String,
          default: null,
          trim: true,
        },

        detailAddress: {
          type: String,
          required: true,
          trim: true,
        },

        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // =========================
    // ROLE
    // =========================
    role: {
      type: String,
      enum: ['user', 'admin', 'administrator', 'manager', 'staff', 'inventory_manager', 'content_editor', 'customer_care'],
      default: 'user',
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
    },

    customPermissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: null,
    },

    lastLoginUserAgent: {
      type: String,
      default: null,
    },

    // =========================
    // AUTHENTICATION & SESSIONS
    // =========================
    refreshToken: {
      type: String,
      select: false,
    },

    sessions: [
      {
        sessionId: {
          type: String,
          required: true,
        },
        deviceName: {
          type: String,
          default: 'Trình duyệt Web',
        },
        deviceType: {
          type: String,
          enum: ['desktop', 'mobile', 'tablet'],
          default: 'desktop',
        },
        browser: {
          type: String,
          default: 'Trình duyệt',
        },
        os: {
          type: String,
          default: 'Không xác định',
        },
        ip: {
          type: String,
          default: '127.0.0.1',
        },
        location: {
          type: String,
          default: 'Hồ Chí Minh, Việt Nam',
        },
        userAgent: {
          type: String,
          default: '',
        },
        lastActiveAt: {
          type: Date,
          default: Date.now,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // =========================
    // RESET PASSWORD
    // =========================
    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
    },

    // =========================
    // VERIFICATION & OTP
    // =========================
    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    phoneOtp: {
      type: String,
      select: false,
    },

    phoneOtpExpires: {
      type: Date,
      select: false,
    },

    // OTP kích hoạt tài khoản (gửi qua email sau đăng ký)
    emailOtp: {
      type: String,
      select: false,
    },

    emailOtpExpires: {
      type: Date,
      select: false,
    },

    // Tài khoản đã được kích hoạt (xác thực OTP sau đăng ký)
    isAccountActivated: {
      type: Boolean,
      default: false,
    },

    // =========================
    // ADMIN EXCLUSIVE AUTH: OTP & PASSKEY
    // =========================
    adminLoginOtp: {
      type: String,
      select: false,
    },

    adminLoginOtpExpires: {
      type: Date,
      select: false,
    },

    passkeys: [
      {
        credentialId: { type: String, required: true },
        publicKey: { type: String, required: true },
        counter: { type: Number, default: 0 },
        deviceName: { type: String, default: 'Khóa bảo mật Passkey' },
        transports: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],

    passkeyChallenge: {
      type: String,
      select: false,
    },

    passkeyChallengeExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// =========================
// HASH PASSWORD (ARGON2)
// =========================
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
};

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await argon2.hash(this.password, ARGON2_OPTIONS);
});

// =========================
// CHECK PASSWORD (ARGON2 + BCRYPT FALLBACK)
// =========================
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;

  if (this.password.startsWith('$argon2')) {
    try {
      return await argon2.verify(this.password, enteredPassword);
    } catch (err) {
      return false;
    }
  }

  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    if (isMatch) {
      try {
        this.password = enteredPassword;
        await this.save();
      } catch (e) {}
    }
    return isMatch;
  }

  return false;
};

// =========================
// CREATE RESET PASSWORD TOKEN
// =========================
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

// =========================
// CREATE EMAIL VERIFICATION TOKEN
// =========================
userSchema.methods.createEmailVerificationToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return verifyToken;
};

// =========================
// CREATE EMAIL OTP (kích hoạt tài khoản, 5 phút)
// =========================
userSchema.methods.createEmailOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
  return otp;
};

// =========================
// CREATE PHONE OTP
// =========================
userSchema.methods.createPhoneOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.phoneOtpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

// =========================
// CREATE ADMIN LOGIN OTP (5 phút)
// =========================
userSchema.methods.createAdminLoginOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.adminLoginOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.adminLoginOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
  return otp;
};

const User = mongoose.model('User', userSchema);
module.exports = User;