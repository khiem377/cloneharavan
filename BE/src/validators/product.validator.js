const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  sku: z.string().min(2, 'Mã SKU sản phẩm phải có ít nhất 2 ký tự'),
  category: z.string().min(24, 'ID Danh mục không hợp lệ'),
  brand: z.string().min(24, 'ID Thương hiệu không hợp lệ'),
  price: z.number().min(0, 'Giá niêm yết không được nhỏ hơn 0'),
  salePrice: z.number().min(0, 'Giá khuyến mãi không được nhỏ hơn 0').optional(),
  stock: z.number().min(0, 'Số lượng tồn kho không được nhỏ hơn 0'),
  thumbnailMediaId: z.string({ required_error: 'Ảnh đại diện là bắt buộc' }),
  imageMediaIds: z.array(z.string()).optional(),
  description: z.string().optional(),
  specifications: z
    .array(
      z.object({
        group: z.string().optional(),
        key: z.string().min(1, 'Tên thông số không được để trống'),
        value: z.string().min(1, 'Giá trị thông số không được để trống'),
      })
    )
    .optional(),
  isFeatured: z.boolean().optional(),
  isHot: z.boolean().optional(),
  status: z.enum(['published', 'draft', 'out_of_stock']).optional(),
  isActive: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema,
};
