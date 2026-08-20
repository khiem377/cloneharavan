const express = require('express');
const router = express.Router();
const svc = require('../services/tag.service');

router.get('/',        async (req, res, next) => { try { res.json(await svc.getAllTags(req.query)); } catch(e) { next(e); } });
router.post('/',       async (req, res, next) => { try { res.status(201).json(await svc.createTag(req.body)); } catch(e) { next(e); } });
router.get('/:slug',   async (req, res, next) => { try { res.json(await svc.getTagBySlug(req.params.slug)); } catch(e) { next(e); } });
router.put('/:id',     async (req, res, next) => { try { res.json(await svc.updateTag(req.params.id, req.body)); } catch(e) { next(e); } });
router.delete('/bulk', async (req, res, next) => { try { res.json(await svc.deleteBulkTags(req.body.ids)); } catch(e) { next(e); } });
router.delete('/:id',  async (req, res, next) => { try { await svc.deleteTag(req.params.id); res.json({ message: 'Đã xóa tag' }); } catch(e) { next(e); } });
router.patch('/:id/status', async (req, res, next) => { try { res.json(await svc.toggleTagStatus(req.params.id, req.body.isActive)); } catch(e) { next(e); } });

module.exports = router;
