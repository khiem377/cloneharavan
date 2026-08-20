const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotion.controller');

router.post('/apply', ctrl.apply);
router.delete('/bulk', ctrl.removeBulk);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.patch('/:id/status', ctrl.toggleStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;
