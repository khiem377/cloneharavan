const { z } = require('zod');

const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .regex(/^[\p{L}\s]+$/u, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng')
    .optional(),

  phone: z
    .string()
    .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0')
    .optional(),

  gender: z
    .enum(['male', 'female', 'other'], {
      errorMap: () => ({ message: 'Giới tính phải là male, female hoặc other' }),
    })
    .optional(),

  dateOfBirth: z
    .string()
    .or(z.date())
    .nullable()
    .optional(),
});

const addressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ và tên người nhận phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được quá 100 ký tự'),

  phone: z
    .string()
    .regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),

  province: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  district: z.string().min(1, 'Quận/Huyện là bắt buộc'),
  ward: z.string().min(1, 'Phường/Xã là bắt buộc'),
  detailAddress: z.string().min(1, 'Địa chỉ chi tiết là bắt buộc'),
  isDefault: z.boolean().optional(),
});

const updateAddressSchema = addressSchema.partial();

const updateStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'Trạng thái isActive là bắt buộc' }),
});

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: 'Role phải là user hoặc admin' }),
  }),
});

module.exports = {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  updateStatusSchema,
  updateRoleSchema,
};
