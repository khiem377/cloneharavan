const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type:     String,
      required: [true, 'Full name is required'],
      trim:     true,
    },
    phone: {
      type:     String,
      required: [true, 'Phone is required'],
      unique:   true,
      trim:     true,
    },
    gender: {
      type:     String,
      enum:     ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:   String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    refreshToken: {
      type:   String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt    = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
