const { z } = require('zod');

const updateBannerSchema = z.object({
  title:     z.string().max(200, 'Tiêu đề không được quá 200 ký tự').optional(),
  link:      z.string().optional(),
  isVisible: z.boolean().optional(),
});

const reorderSchema = z.array(
  z.object({
    id:       z.string().min(1, 'ID không hợp lệ'),
    position: z.number().int().min(0, 'Vị trí phải là số nguyên không âm'),
  })
).min(1, 'Danh sách không được rỗng');

const deleteBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Vui lòng chọn ít nhất 1 banner'),
});

module.exports = { updateBannerSchema, reorderSchema, deleteBulkSchema };
