const { z } = require('zod');

const flashSaleItemSchema = z.object({
  productId: z.string().min(1, 'Product ID là bắt buộc'),
  variantId: z.string().nullable().optional(),
  originalPrice: z.number().min(0, 'Giá gốc không được âm'),
  flashSalePrice: z.number().min(0, 'Giá Flash Sale không được âm'),
  stockLimit: z.number().int().min(1, 'Số lượng phải lớn hơn 0'),
  soldCount: z.number().int().min(0).optional().default(0),
});

const createFlashSaleSchema = z.object({
  name: z.string().min(1, 'Tên chương trình là bắt buộc').trim(),
  description: z.string().optional().default(''),
  bannerMediaId: z.string().nullable().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Ngày bắt đầu không hợp lệ'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Ngày kết thúc không hợp lệ'),
  isActive: z.boolean().optional().default(true),
  items: z.array(flashSaleItemSchema).min(1, 'Cần có ít nhất 1 sản phẩm tham gia Flash Sale'),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu', path: ['endDate'] }
);

const updateFlashSaleSchema = z.object({
  name: z.string().min(1, 'Tên chương trình là bắt buộc').trim().optional(),
  description: z.string().optional(),
  bannerMediaId: z.string().nullable().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Ngày bắt đầu không hợp lệ').optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Ngày kết thúc không hợp lệ').optional(),
  isActive: z.boolean().optional(),
  items: z.array(flashSaleItemSchema).min(1, 'Cần có ít nhất 1 sản phẩm tham gia Flash Sale').optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  { message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu', path: ['endDate'] }
);

module.exports = {
  createFlashSaleSchema,
  updateFlashSaleSchema,
};
