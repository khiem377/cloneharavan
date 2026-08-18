const { z } = require('zod');

const createBrandSchema = z.object({
  name: z.string().min(2, 'Tên thương hiệu phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  logoMediaId: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

const updateBrandSchema = createBrandSchema.partial();

module.exports = {
  createBrandSchema,
  updateBrandSchema,
};
