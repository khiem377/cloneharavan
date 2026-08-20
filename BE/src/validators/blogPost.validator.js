const { z } = require('zod');

const objectId = (label) =>
  z.preprocess(
    v => (v === '' || v == null ? null : v),
    z.string().regex(/^[a-f\d]{24}$/i, `${label} không hợp lệ`).nullable().optional()
  );

const createBlogPostSchema = z.object({
  title:            z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(200, 'Tiêu đề không được quá 200 ký tự'),
  content:          z.string().min(1, 'Vui lòng nhập nội dung bài viết'),
  excerpt:          z.string().max(500, 'Mô tả ngắn không được quá 500 ký tự').optional().default(''),
  categories: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Danh mục chứa giá trị không hợp lệ')).min(1, 'Vui lòng chọn ít nhất một danh mục').optional().default([]),
  tags:             z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Tag chứa giá trị không hợp lệ')).optional().default([]),
  thumbnailMediaId: objectId('Ảnh thumbnail'),
  thumbnailUrl:     z.string().optional().default(''),
  metaTitle:        z.string().max(70, 'Meta title không được quá 70 ký tự').optional().default(''),
  metaDescription:  z.string().max(160, 'Meta description không được quá 160 ký tự').optional().default(''),
  canonicalUrl:     z.string().optional().default(''),
  status:           z.enum(['draft', 'pending_review', 'published', 'archived'], {
    errorMap: () => ({ message: 'Trạng thái bài viết không hợp lệ' }),
  }).optional().default('draft'),
  isActive:         z.boolean().optional().default(true),
  isPinned:         z.boolean().optional().default(false),
  isFeatured:       z.boolean().optional().default(false),
  allowComment:     z.boolean().optional().default(true),
  scheduledAt:      z.string().nullable().optional().transform(v => v || null),
  authorId:         objectId('Tác giả'),
  relatedPostIds:   z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Bài viết liên quan chứa giá trị không hợp lệ')).optional().default([]),
});

const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  content: z.string().min(1, 'Vui lòng nhập nội dung bài viết').optional(),
});

module.exports = { createBlogPostSchema, updateBlogPostSchema };
