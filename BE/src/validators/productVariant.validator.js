const { z } = require('zod');

const attributeSchema = z.object({
  name: z.string({ required_error: 'Tên thuộc tính là bắt buộc' }).min(1, 'Tên thuộc tính không được để trống'),
  value: z.string({ required_error: 'Giá trị thuộc tính là bắt buộc' }).min(1, 'Giá trị thuộc tính không được để trống'),
  colorCode: z.string().optional().default(''),
});

const createVariantSchema = z.object({
  attributes: z.array(attributeSchema, {
    required_error: 'Vui lòng nhập ít nhất 1 thuộc tính cho biến thể',
  }).min(1, 'Biến thể phải có ít nhất 1 thuộc tính'),

  sku: z.string({
    invalid_type_error: 'Mã SKU phải là chuỗi ký tự',
  }).min(2, 'Mã SKU phải có ít nhất 2 ký tự').optional().or(z.literal('')),

  price: z.number({
    invalid_type_error: 'Giá phải là số',
  }).min(0, 'Giá không được nhỏ hơn 0').nullable().optional(),

  salePrice: z.number({
    invalid_type_error: 'Giá khuyến mãi phải là số',
  }).min(0, 'Giá khuyến mãi không được nhỏ hơn 0').nullable().optional(),

  stock: z.number({
    required_error: 'Vui lòng nhập số lượng tồn kho',
    invalid_type_error: 'Số lượng tồn kho phải là số',
  }).min(0, 'Số lượng tồn kho không được nhỏ hơn 0'),

  thumbnailMediaId: z.string().regex(/^[a-f\d]{24}$/i, 'Ảnh đại diện biến thể không hợp lệ').nullable().optional(),
  imageMediaIds: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Ảnh sản phẩm chứa giá trị không hợp lệ')).optional().default([]),
  position: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
  nameOverride: z.string().optional().nullable(),
  descriptionOverride: z.string().optional().nullable(),
  specifications: z.array(z.object({
    group: z.string().optional().default('Thông tin chung'),
    key: z.string().min(1, 'Tên thông số không được để trống'),
    value: z.string().min(1, 'Giá trị thông số không được để trống'),
  })).optional().default([]),
});

const updateVariantSchema = createVariantSchema.partial();

const bulkCreateVariantSchema = z.object({
  variants: z.array(createVariantSchema, {
    required_error: 'Danh sách biến thể là bắt buộc',
  }).min(1, 'Phải có ít nhất 1 biến thể'),
});

module.exports = { createVariantSchema, updateVariantSchema, bulkCreateVariantSchema };
