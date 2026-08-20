const express = require('express');
const router  = express.Router();
const svc     = require('../services/blogCategory.service');
const { validate } = require('../middleware/validate.middleware');
const { createBlogCategorySchema, updateBlogCategorySchema } = require('../validators/blogCategory.validator');

router.get('/',              async (req, res, next) => { try { res.json(await svc.getAllBlogCategories(req.query)); } catch(e) { next(e); } });
router.post('/',             validate(createBlogCategorySchema), async (req, res, next) => { try { res.status(201).json(await svc.createBlogCategory(req.body)); } catch(e) { next(e); } });
router.patch('/reorder',     async (req, res, next) => { try { await svc.reorderBlogCategories(req.body.items); res.json({ ok: true }); } catch(e) { next(e); } });
router.delete('/bulk',       async (req, res, next) => { try { res.json(await svc.deleteBulkBlogCategories(req.body.ids)); } catch(e) { next(e); } });
router.get('/:slug',         async (req, res, next) => { try { res.json(await svc.getBlogCategoryBySlug(req.params.slug)); } catch(e) { next(e); } });
router.put('/:id',           validate(updateBlogCategorySchema), async (req, res, next) => { try { res.json(await svc.updateBlogCategory(req.params.id, req.body)); } catch(e) { next(e); } });
router.delete('/:id',        async (req, res, next) => { try { await svc.deleteBlogCategory(req.params.id); res.json({ message: 'Đã xóa danh mục' }); } catch(e) { next(e); } });
router.patch('/:id/status',  async (req, res, next) => { try { res.json(await svc.toggleBlogCategoryStatus(req.params.id, req.body.isActive)); } catch(e) { next(e); } });

module.exports = router;
