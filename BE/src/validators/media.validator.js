const { z } = require('zod');

const uploadMediaSchema = z.object({
  folderId: z.string().min(1, 'Vui lòng chọn folder'),
});

const deleteMediaSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Vui lòng chọn ít nhất 1 file'),
});

const createFolderSchema = z.object({
  name: z.string().min(1, 'Tên folder không được để trống').max(100),
  parentId: z.string().optional(),
});

const reorderFolderSchema = z.array(
  z.object({
    id: z.string().min(1),
    position: z.number().int().min(0),
  })
).min(1);

module.exports = { uploadMediaSchema, deleteMediaSchema, createFolderSchema, reorderFolderSchema };

