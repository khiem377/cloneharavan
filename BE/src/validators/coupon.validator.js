const { z } = require('zod');

const baseCouponSchema = z.object({
  name: z.string({ required_error: 'Vui lòng nhập tên mã giảm giá' }).min(2, 'Tên phải có ít nhất 2 ký tự'),
  code: z.string({ required_error: 'Vui lòng nhập mã giảm giá' }).min(2, 'Mã code phải có ít nhất 2 ký tự'),
  description: z.string().optional().default(''),
  type: z.enum(['percent', 'fixed'], {
    required_error: 'Vui lòng chọn loại giảm giá',
    invalid_type_error: 'Loại giảm giá không hợp lệ',
  }),
  value: z.number({
    required_error: 'Vui lòng nhập giá trị giảm',
    invalid_type_error: 'Giá trị giảm phải là số',
  }).positive('Giá trị giảm phải lớn hơn 0'),
  maxDiscount: z.number({ invalid_type_error: 'Giảm tối đa phải là số' }).positive('Giảm tối đa phải lớn hơn 0').nullable().optional().default(null),
  minOrderValue: z.number({ invalid_type_error: 'Giá trị đơn tối thiểu phải là số' }).min(0, 'Giá trị đơn tối thiểu không được âm').optional().default(0),
  startDate: z.coerce.date({ required_error: 'Vui lòng chọn ngày bắt đầu', invalid_type_error: 'Ngày bắt đầu không hợp lệ' }),
  endDate: z.coerce.date({ required_error: 'Vui lòng chọn ngày kết thúc', invalid_type_error: 'Ngày kết thúc không hợp lệ' }),
  isActive: z.boolean().optional().default(true),
  usageLimit: z.number({ invalid_type_error: 'Giới hạn sử dụng phải là số' }).positive('Giới hạn sử dụng phải lớn hơn 0').nullable().optional().default(null),
});

const createCouponSchema = baseCouponSchema
  .refine((d) => d.endDate > d.startDate, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  .refine((d) => d.type !== 'percent' || d.value <= 100, {
    message: 'Giá trị phần trăm không được vượt quá 100',
    path: ['value'],
  });

// Dùng base schema (không có refine) để .partial() hoạt động
const updateCouponSchema = baseCouponSchema.partial().omit({ code: true });

module.exports = { createCouponSchema, updateCouponSchema };

