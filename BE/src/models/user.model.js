const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
      required: [true, 'Phone is required'],
      unique: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
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
      required: [true, 'Password is required'],
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

        district: {
          type: String,
          required: true,
          trim: true,
        },

        ward: {
          type: String,
          required: true,
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
      enum: ['user', 'admin'],
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // AUTHENTICATION
    // =========================
    refreshToken: {
      type: String,
      select: false,
    },

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
  },
  { timestamps: true }
);

// =========================
// HASH PASSWORD
// =========================
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// =========================
// CHECK PASSWORD
// =========================
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// =========================
// CREATE RESET PASSWORD TOKEN
// =========================
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
  return resetToken;
};

// =========================
// CREATE EMAIL VERIFICATION TOKEN
// =========================
userSchema.methods.createEmailVerificationToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 giờ
  return verifyToken;
};

// =========================
// CREATE PHONE OTP
// =========================
userSchema.methods.createPhoneOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
  this.phoneOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.phoneOtpExpires = Date.now() + 5 * 60 * 1000; // 5 phút
  return otp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;