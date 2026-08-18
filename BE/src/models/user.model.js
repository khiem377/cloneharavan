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
// HASH PASSWORD (ARGON2)
// =========================
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
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
// CREATE PHONE OTP
// =========================
userSchema.methods.createPhoneOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneOtp = crypto.createHash('sha256').update(otp).digest('hex');
  this.phoneOtpExpires = Date.now() + 5 * 60 * 1000;
  return otp;
};

const User = mongoose.model('User', userSchema);
module.exports = User;