const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string({
    required_error: 'Vui lòng nhập tên sản phẩm',
    invalid_type_error: 'Tên sản phẩm phải là chuỗi ký tự',
  }).min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),

  slug: z.string().optional(),

  // Mã nội bộ sản phẩm — không bắt buộc, Backend sẽ tự sinh nếu bỏ trống
  productCode: z.string({
    invalid_type_error: 'Mã sản phẩm phải là chuỗi ký tự',
  }).min(2, 'Mã sản phẩm phải có ít nhất 2 ký tự').optional().or(z.literal('')),

  categories: z.array(
    z.string({ invalid_type_error: 'Danh mục không hợp lệ' }).min(24, 'Danh mục không hợp lệ'),
    { required_error: 'Vui lòng chọn ít nhất 1 danh mục', invalid_type_error: 'Danh sách danh mục không hợp lệ' }
  ).min(1, 'Vui lòng chọn ít nhất 1 danh mục'),

  brand: z.string({
    invalid_type_error: 'Thương hiệu không hợp lệ',
  }).min(24, 'Vui lòng chọn thương hiệu hợp lệ').nullable().optional(),

  thumbnailMediaId: z.string({
    required_error: 'Vui lòng chọn ảnh đại diện sản phẩm',
    invalid_type_error: 'Ảnh đại diện không hợp lệ',
  }).regex(/^[a-f\d]{24}$/i, 'thumbnailMediaId không hợp lệ, phải là ObjectId 24 ký tự'),

  imageMediaIds: z.array(
    z.string().regex(/^[a-f\d]{24}$/i, 'Ảnh sản phẩm chứa ID không hợp lệ')
  ).optional(),

  description: z.string().optional(),

  specifications: z.array(
    z.object({
      group: z.string().optional(),
      key: z.string().min(1, 'Tên thông số không được để trống'),
      value: z.string().min(1, 'Giá trị thông số không được để trống'),
    })
  ).optional(),

  isFeatured: z.boolean().optional(),
  isHot: z.boolean().optional(),

  status: z.enum(['published', 'draft', 'out_of_stock'], {
    invalid_type_error: 'Trạng thái sản phẩm không hợp lệ',
  }).optional(),

  isActive: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema,
};
