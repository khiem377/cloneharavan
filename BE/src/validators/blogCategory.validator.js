const { z } = require('zod');

const objectId = (label) =>
  z.preprocess(
    v => (v === '' || v == null ? null : v),
    z.string().regex(/^[a-f\d]{24}$/i, `${label} không hợp lệ`).nullable().optional()
  );

const createBlogCategorySchema = z.object({
  name:             z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự').max(100, 'Tên không được quá 100 ký tự'),
  slug:             z.string().optional(),
  description:      z.string().max(500, 'Mô tả không được quá 500 ký tự').optional().default(''),
  thumbnailMediaId: objectId('Ảnh đại diện'),
  thumbnailUrl:     z.string().optional().default(''),
  parentId:         objectId('Danh mục cha'),
  order:            z.number().int('Thứ tự phải là số nguyên').min(0, 'Thứ tự phải từ 0 trở lên').optional().default(0),
  metaTitle:        z.string().max(70, 'Meta title không được quá 70 ký tự').optional().default(''),
  metaDescription:  z.string().max(160, 'Meta description không được quá 160 ký tự').optional().default(''),
  isActive:         z.boolean().optional().default(true),
});

const updateBlogCategorySchema = createBlogCategorySchema.partial();

module.exports = { createBlogCategorySchema, updateBlogCategorySchema };
