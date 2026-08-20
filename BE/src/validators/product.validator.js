const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string({
    required_error: 'Vui lòng nhập tên sản phẩm',
    invalid_type_error: 'Tên sản phẩm phải là chuỗi ký tự',
  }).min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),

  slug: z.string().optional(),

  sku: z.string({
    required_error: 'Vui lòng nhập mã SKU',
    invalid_type_error: 'Mã SKU phải là chuỗi ký tự',
  }).min(2, 'Mã SKU phải có ít nhất 2 ký tự'),

  categories: z.array(
    z.string({ invalid_type_error: 'Danh mục không hợp lệ' }).min(24, 'Danh mục không hợp lệ'),
    { required_error: 'Vui lòng chọn ít nhất 1 danh mục', invalid_type_error: 'Danh sách danh mục không hợp lệ' }
  ).min(1, 'Vui lòng chọn ít nhất 1 danh mục'),

  brand: z.string({
    invalid_type_error: 'Thương hiệu không hợp lệ',
  }).min(24, 'Vui lòng chọn thương hiệu hợp lệ').nullable().optional(),

  price: z.number({
    required_error: 'Vui lòng nhập giá niêm yết',
    invalid_type_error: 'Giá niêm yết phải là số',
  }).min(0, 'Giá niêm yết không được nhỏ hơn 0'),

  salePrice: z.number({
    invalid_type_error: 'Giá khuyến mãi phải là số',
  }).min(0, 'Giá khuyến mãi không được nhỏ hơn 0').optional(),

  stock: z.number({
    required_error: 'Vui lòng nhập số lượng tồn kho',
    invalid_type_error: 'Số lượng tồn kho phải là số',
  }).min(0, 'Số lượng tồn kho không được nhỏ hơn 0'),

  thumbnailMediaId: z.string({
    required_error: 'Vui lòng chọn ảnh đại diện sản phẩm',
    invalid_type_error: 'Ảnh đại diện không hợp lệ',
  }),

  imageMediaIds: z.array(z.string()).optional(),

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
