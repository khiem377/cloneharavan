const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  link: z.string().optional(),
  imageMediaId: z.string().optional(),
  iconMediaId: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  showOnMenu: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
