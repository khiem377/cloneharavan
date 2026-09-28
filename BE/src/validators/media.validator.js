const { z } = require('zod');

const uploadMediaSchema = z.object({
  folderId: z.string().min(1, 'Vui lòng chọn folder'),
});

// Xóa bulk — có thêm force flag
const deleteMediaSchema = z.object({
  ids:   z.array(z.string().min(1)).min(1, 'Vui lòng chọn ít nhất 1 file'),
  force: z.boolean().optional().default(false),
});

// Đổi tên file
const renameMediaSchema = z.object({
  filename: z.string().min(1, 'Tên file không được để trống').max(255),
});

// Cập nhật altText / caption — đều optional, không bắt buộc
const updateMediaMetaSchema = z.object({
  altText: z.string().max(500).optional(),
  caption: z.string().max(1000).optional(),
}).refine((d) => d.altText !== undefined || d.caption !== undefined, {
  message: 'Cần ít nhất altText hoặc caption',
});

// Chuyển nhiều file sang folder khác
const bulkMoveMediaSchema = z.object({
  ids:            z.array(z.string().min(1)).min(1, 'Vui lòng chọn ít nhất 1 file'),
  targetFolderId: z.string().min(1, 'Vui lòng chọn folder đích'),
});

const createFolderSchema = z.object({
  name:     z.string().min(1, 'Tên folder không được để trống').max(100),
  parentId: z.string().optional(),
});

const reorderFolderSchema = z.array(
  z.object({
    id:       z.string().min(1),
    position: z.number().int().min(0),
  })
).min(1);

module.exports = {
  uploadMediaSchema,
  deleteMediaSchema,
  renameMediaSchema,
  updateMediaMetaSchema,
  bulkMoveMediaSchema,
  createFolderSchema,
  reorderFolderSchema,
};
