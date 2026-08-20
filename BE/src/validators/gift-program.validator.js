const { z } = require('zod');

const giftProductSchema = z.object({
  productId: z.string().min(1, 'productId là bắt buộc'),
  qty: z.number().int().min(1).default(1),
});

const scopeSchema = z
  .object({
    type: z.enum(['all', 'products', 'categories']).default('all'),
    productIds: z.array(z.string()).optional().default([]),
    categoryIds: z.array(z.string()).optional().default([]),
  })
  .default({ type: 'all' });

const createGiftProgramSchema = z
  .object({
    name: z.string({ required_error: 'Vui lòng nhập tên chương trình' }).min(1, 'Tên chương trình là bắt buộc').max(200),
    description: z.string().optional().default(''),
    giftType: z.enum(['same_product', 'different_product'], {
      required_error: 'Vui lòng chọn loại tặng quà',
      invalid_type_error: 'Loại tặng quà không hợp lệ',
    }),
    scope: scopeSchema,
    triggerQty: z.number({ required_error: 'Vui lòng nhập số lượng kích hoạt', invalid_type_error: 'Số lượng kích hoạt phải là số' }).int().min(1, 'Số lượng kích hoạt phải lớn hơn 0'),
    giftQty: z.number({ invalid_type_error: 'Số lượng tặng phải là số' }).int().min(1, 'Số lượng tặng phải lớn hơn 0').nullable().optional(),
    giftProducts: z.array(giftProductSchema).optional().default([]),
    giftLimit: z.number({ invalid_type_error: 'Giới hạn tặng phải là số' }).int().min(1, 'Giới hạn tặng phải lớn hơn 0').nullable().optional(),
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
      if (d.giftType === 'same_product') return d.giftQty !== null && d.giftQty !== undefined;
      return true;
    },
    { message: 'Loại tặng cùng sản phẩm cần có số lượng tặng (giftQty)', path: ['giftQty'] }
  )
  .refine(
    (d) => {
      if (d.giftType === 'different_product') return d.giftProducts.length > 0;
      return true;
    },
    { message: 'Loại tặng khác sản phẩm cần ít nhất 1 sản phẩm tặng', path: ['giftProducts'] }
  );

const updateGiftProgramSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    scope: scopeSchema.optional(),
    triggerQty: z.number().int().min(1).optional(),
    giftQty: z.number().int().min(1).nullable().optional(),
    giftProducts: z.array(giftProductSchema).optional(),
    giftLimit: z.number().int().min(1).nullable().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.endDate > d.startDate;
      return true;
    },
    { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] }
  );

module.exports = { createGiftProgramSchema, updateGiftProgramSchema };
