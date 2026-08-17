const mongoose = require('mongoose');
const argon2 = require('argon2');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
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
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

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
      } catch (e) {

      }
    }
    return isMatch;
  }

  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
