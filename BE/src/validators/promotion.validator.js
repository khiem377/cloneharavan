const { z } = require('zod');

const scopeSchema = z
  .object({
    type: z.enum(['all', 'products', 'categories']).default('all'),
    productIds: z.array(z.string()).optional().default([]),
    categoryIds: z.array(z.string()).optional().default([]),
  })
  .default({ type: 'all' });

const createPromotionSchema = z
  .object({
    name: z.string({ required_error: 'Vui lòng nhập tên chương trình' }).min(1, 'Tên chương trình là bắt buộc').max(200),
    description: z.string().optional().default(''),
    type: z.enum(['percent_discount', 'fixed_discount', 'buy_x_pay_y', 'quantity_discount'], {
      required_error: 'Vui lòng chọn loại khuyến mãi',
      invalid_type_error: 'Loại khuyến mãi không hợp lệ',
    }),
    triggerQty: z.number({ invalid_type_error: 'Số lượng kích hoạt phải là số' }).int().min(1, 'Số lượng kích hoạt phải lớn hơn 0').nullable().optional(),
    payQty: z.number({ invalid_type_error: 'Số lượng phải trả phải là số' }).int().min(1, 'Số lượng phải trả phải lớn hơn 0').nullable().optional(),
    discountType: z.enum(['percent', 'fixed'], { invalid_type_error: 'Kiểu giảm giá không hợp lệ' }).nullable().optional(),
    discountValue: z.number({ invalid_type_error: 'Giá trị giảm phải là số' }).min(0, 'Giá trị giảm không được âm').nullable().optional(),
    maxDiscountValue: z.number({ invalid_type_error: 'Giảm tối đa phải là số' }).min(0).nullable().optional(),
    scope: scopeSchema,
    minOrderValue: z.number({ invalid_type_error: 'Giá trị đơn hàng tối thiểu phải là số' }).min(0).nullable().optional(),
    usageLimit: z.number({ invalid_type_error: 'Giới hạn sử dụng phải là số' }).int().min(1, 'Giới hạn sử dụng phải lớn hơn 0').nullable().optional(),
    startDate: z.coerce.date({ required_error: 'Vui lòng chọn ngày bắt đầu', invalid_type_error: 'Ngày bắt đầu không hợp lệ' }),
    endDate: z.coerce.date({ required_error: 'Vui lòng chọn ngày kết thúc', invalid_type_error: 'Ngày kết thúc không hợp lệ' }),
    isActive: z.boolean().optional().default(true),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  .refine(
    (d) => {
      if (d.type === 'percent_discount')
        return d.discountValue !== null && d.discountValue !== undefined && d.discountValue > 0 && d.discountValue <= 100;
      return true;
    },
    { message: 'Giá trị % phải từ 1 đến 100', path: ['discountValue'] }
  )
  .refine(
    (d) => {
      if (d.type === 'fixed_discount')
        return d.discountValue !== null && d.discountValue !== undefined && d.discountValue > 0;
      return true;
    },
    { message: 'Giá trị giảm cố định phải lớn hơn 0', path: ['discountValue'] }
  )
  .refine(
    (d) => {
      if (d.type === 'buy_x_pay_y')
        return d.triggerQty && d.payQty && d.payQty < d.triggerQty;
      return true;
    },
    { message: 'Số lượng phải trả phải nhỏ hơn số lượng kích hoạt', path: ['payQty'] }
  )
  .refine(
    (d) => {
      if (d.type === 'quantity_discount')
        return d.triggerQty && d.discountType && d.discountValue !== null && d.discountValue !== undefined;
      return true;
    },
    { message: 'quantity_discount cần triggerQty, discountType và discountValue', path: ['discountValue'] }
  );

const updatePromotionSchema = z
  .object({
    name:             z.string({ invalid_type_error: 'Tên chương trình phải là chuỗi' }).min(1, 'Tên chương trình không được để trống').max(200).optional(),
    description:      z.string().optional(),
    triggerQty:       z.number({ invalid_type_error: 'Số lượng kích hoạt phải là số' }).int().min(1, 'Số lượng kích hoạt phải lớn hơn 0').nullable().optional(),
    payQty:           z.number({ invalid_type_error: 'Số lượng phải trả phải là số' }).int().min(1, 'Số lượng phải trả phải lớn hơn 0').nullable().optional(),
    discountType:     z.enum(['percent', 'fixed'], { errorMap: () => ({ message: 'Kiểu giảm giá không hợp lệ' }) }).nullable().optional(),
    discountValue:    z.number({ invalid_type_error: 'Giá trị giảm phải là số' }).min(0, 'Giá trị giảm không được âm').nullable().optional(),
    maxDiscountValue: z.number({ invalid_type_error: 'Giảm tối đa phải là số' }).min(0).nullable().optional(),
    scope:            scopeSchema.optional(),
    minOrderValue:    z.number({ invalid_type_error: 'Giá trị đơn hàng tối thiểu phải là số' }).min(0).nullable().optional(),
    usageLimit:       z.number({ invalid_type_error: 'Giới hạn sử dụng phải là số' }).int().min(1, 'Giới hạn sử dụng phải lớn hơn 0').nullable().optional(),
    startDate:        z.coerce.date({ invalid_type_error: 'Ngày bắt đầu không hợp lệ' }).optional(),
    endDate:          z.coerce.date({ invalid_type_error: 'Ngày kết thúc không hợp lệ' }).optional(),
    isActive:         z.boolean({ invalid_type_error: 'Trạng thái phải là boolean' }).optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.endDate > d.startDate;
      return true;
    },
    { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] }
  );

module.exports = { createPromotionSchema, updatePromotionSchema };
