const { z } = require('zod');

const passwordRule = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số');

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .regex(/^[\p{L}\s]+$/u, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),

  phone: z
    .string()
    .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),

  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' }),
  }),

  email:    z.string().email('Email không đúng định dạng'),
  password: passwordRule,
});

const loginSchema = z.object({
  email:    z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword:     passwordRule,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path:    ['confirmPassword'],
  });

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token đặt lại mật khẩu là bắt buộc').optional(),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Mã token xác minh email là bắt buộc'),
});

const verifyPhoneSchema = z.object({
  otp: z.string().length(6, 'Mã OTP phải gồm đúng 6 chữ số'),
});

const registerAdminSchema = z.object({
  fullName: z
    .string({ required_error: 'Họ và tên là bắt buộc' })
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .regex(/^[\p{L}\s]+$/u, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),

  phone: z
    .string({ required_error: 'Số điện thoại là bắt buộc' })
    .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),

  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' }),
  }),

  email: z.string({ required_error: 'Email là bắt buộc' }).email('Email không đúng định dạng'),
  password: passwordRule,

  dateOfBirth: z
    .string()
    .or(z.date())
    .nullable()
    .optional(),

  adminSecretKey: z.string().optional(),
});

module.exports = {
  passwordRule,
  registerSchema,
  registerAdminSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
};

