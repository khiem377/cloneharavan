const express = require('express');
const router  = express.Router();
const svc     = require('../services/blogCategory.service');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createBlogCategorySchema, updateBlogCategorySchema } = require('../validators/blogCategory.validator');

// Public routes
router.get('/',              async (req, res, next) => { try { res.json(await svc.getAllBlogCategories(req.query)); } catch(e) { next(e); } });
router.get('/:slug',         async (req, res, next) => { try { res.json(await svc.getBlogCategoryBySlug(req.params.slug)); } catch(e) { next(e); } });

// Protected Admin routes
router.post('/',             protect, requirePermission('blog_category.manage'), validate(createBlogCategorySchema), async (req, res, next) => { try { res.status(201).json(await svc.createBlogCategory(req.body)); } catch(e) { next(e); } });
router.patch('/reorder',     protect, requirePermission('blog_category.manage'), async (req, res, next) => { try { await svc.reorderBlogCategories(req.body.items); res.json({ ok: true }); } catch(e) { next(e); } });
router.put('/:id',           protect, requirePermission('blog_category.manage'), validate(updateBlogCategorySchema), async (req, res, next) => { try { res.json(await svc.updateBlogCategory(req.params.id, req.body)); } catch(e) { next(e); } });
router.patch('/:id/status',  protect, requirePermission('blog_category.manage'), async (req, res, next) => { try { res.json(await svc.toggleBlogCategoryStatus(req.params.id, req.body.isActive)); } catch(e) { next(e); } });
router.delete('/bulk',       protect, requirePermission('blog_category.manage'), async (req, res, next) => { try { res.json(await svc.deleteBulkBlogCategories(req.body.ids)); } catch(e) { next(e); } });
router.delete('/:id',        protect, requirePermission('blog_category.manage'), async (req, res, next) => { try { await svc.deleteBlogCategory(req.params.id); res.json({ message: 'Đã xóa danh mục' }); } catch(e) { next(e); } });

module.exports = router;
