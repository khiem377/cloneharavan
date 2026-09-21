const express = require('express');
const router = express.Router();
const svc = require('../services/tag.service');
const { protect } = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.get('/',        async (req, res, next) => { try { res.json(await svc.getAllTags(req.query)); } catch(e) { next(e); } });
router.get('/:slug',   async (req, res, next) => { try { res.json(await svc.getTagBySlug(req.params.slug)); } catch(e) { next(e); } });

router.post('/',       protect, requirePermission('tag.manage'), async (req, res, next) => { try { res.status(201).json(await svc.createTag(req.body, req.user, req)); } catch(e) { next(e); } });
router.put('/:id',     protect, requirePermission('tag.manage'), async (req, res, next) => { try { res.json(await svc.updateTag(req.params.id, req.body, req.user, req)); } catch(e) { next(e); } });
router.patch('/:id/status', protect, requirePermission('tag.manage'), async (req, res, next) => { try { res.json(await svc.toggleTagStatus(req.params.id, req.body.isActive, req.user, req)); } catch(e) { next(e); } });
router.delete('/bulk', protect, requirePermission('tag.manage'), async (req, res, next) => { try { res.json(await svc.deleteBulkTags(req.body.ids)); } catch(e) { next(e); } });
router.delete('/:id',  protect, requirePermission('tag.manage'), async (req, res, next) => { try { await svc.deleteTag(req.params.id, req.user, req); res.json({ message: 'Đã xóa tag' }); } catch(e) { next(e); } });

module.exports = router;
