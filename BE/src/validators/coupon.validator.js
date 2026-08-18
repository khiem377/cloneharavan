const { z } = require('zod');

const baseCouponSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  code: z.string().min(2, 'Mã code phải có ít nhất 2 ký tự'),
  description: z.string().optional().default(''),
  type: z.enum(['percent', 'fixed'], { required_error: 'Loại giảm giá là bắt buộc' }),
  value: z.number({ required_error: 'Giá trị giảm là bắt buộc' }).positive('Giá trị phải lớn hơn 0'),
  maxDiscount: z.number().positive().nullable().optional().default(null),
  minOrderValue: z.number().min(0).optional().default(0),
  startDate: z.coerce.date({ required_error: 'Ngày bắt đầu là bắt buộc' }),
  endDate: z.coerce.date({ required_error: 'Ngày kết thúc là bắt buộc' }),
  isActive: z.boolean().optional().default(true),
  usageLimit: z.number().positive().nullable().optional().default(null),
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

