const express = require('express');
const router  = express.Router();
const svc     = require('../services/blogPost.service');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createBlogPostSchema, updateBlogPostSchema } = require('../validators/blogPost.validator');

// Public routes
router.get('/',             async (req, res, next) => { try { res.json(await svc.getAllPosts(req.query)); } catch(e) { next(e); } });
router.get('/id/:id',       async (req, res, next) => { try { res.json(await svc.getPostById(req.params.id)); } catch(e) { next(e); } });
router.get('/locate',       protect, requirePermission('blog.edit'), async (req, res, next) => {
  try {
    const { id, limit } = req.query;
    if (!id) return res.status(400).json({ message: 'Thiếu param id' });
    const result = await svc.locatePost(id, Number(limit) || 10);
    res.json({ status: 'success', data: result });
  } catch (e) { next(e); }
});
router.get('/:slug',        async (req, res, next) => { try { res.json(await svc.getPostBySlug(req.params.slug)); } catch(e) { next(e); } });
router.post('/:slug/view',  async (req, res, next) => { try { await svc.incrementViews(req.params.slug); res.json({ ok: true }); } catch(e) { next(e); } });

// Protected Admin routes
router.post('/',            protect, requirePermission('blog.create'), validate(createBlogPostSchema), async (req, res, next) => { try { res.status(201).json(await svc.createPost(req.body, req.user?._id || req.body.authorId)); } catch(e) { next(e); } });
router.put('/:id',          protect, requirePermission('blog.edit'), validate(updateBlogPostSchema), async (req, res, next) => { try { res.json(await svc.updatePost(req.params.id, req.body)); } catch(e) { next(e); } });
router.patch('/:id/status', protect, requirePermission('blog.edit'), async (req, res, next) => { try { res.json(await svc.togglePostStatus(req.params.id, req.body.isActive)); } catch(e) { next(e); } });
router.delete('/bulk',      protect, requirePermission('blog.delete'), async (req, res, next) => { try { res.json(await svc.deleteBulkPosts(req.body.ids)); } catch(e) { next(e); } });
router.delete('/:id',       protect, requirePermission('blog.delete'), async (req, res, next) => { try { await svc.deletePost(req.params.id); res.json({ message: 'Đã xóa bài viết' }); } catch(e) { next(e); } });

module.exports = router;
