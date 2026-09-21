const { z } = require('zod');
const { BANNER_TYPES } = require('../models/banner.model');

const bannerItemSchema = z.object({
  id:       z.string().min(1, 'ID không hợp lệ'),
  position: z.number().int().min(0, 'Vị trí phải là số nguyên không âm'),
});

// Create
const createBannerSchema = z.object({
  title:     z.string().max(200).optional(),
  altText:   z.string().max(300).optional(),
  link:      z.string().optional(),
  type:      z.enum(BANNER_TYPES).optional().default('hero'),
  isVisible: z.preprocess((v) => v === 'true' || v === true, z.boolean()).optional(),
  startAt:   z.string().optional().nullable(),
  endAt:     z.string().optional().nullable(),
  mediaId:   z.string().optional(),
}).refine(
  (d) => !d.startAt || !d.endAt || new Date(d.startAt) < new Date(d.endAt),
  { message: 'startAt phải nhỏ hơn endAt', path: ['endAt'] }
);

// Update — tất cả optional
const updateBannerSchema = z.object({
  title:     z.string().max(200).optional(),
  altText:   z.string().max(300).optional(),
  link:      z.string().optional(),
  type:      z.enum(BANNER_TYPES).optional(),
  isVisible: z.boolean().optional(),
  startAt:   z.string().nullable().optional(),
  endAt:     z.string().nullable().optional(),
}).refine(
  (d) => !d.startAt || !d.endAt || new Date(d.startAt) < new Date(d.endAt),
  { message: 'startAt phải nhỏ hơn endAt', path: ['endAt'] }
);

const reorderSchema = z.union([
  z.array(bannerItemSchema).min(1, 'Danh sách không được rỗng'),
  z.object({ items: z.array(bannerItemSchema).min(1) }),
]);

const deleteBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Vui lòng chọn ít nhất 1 banner'),
});

module.exports = { createBannerSchema, updateBannerSchema, reorderSchema, deleteBulkSchema };
