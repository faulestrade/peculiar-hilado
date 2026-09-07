const router = require('express').Router();
const ctrl = require('../controllers/banner.controller');
const auth = require('../middleware/auth');

router.get('/active', ctrl.getActive);
router.get('/', auth, ctrl.getAll);
router.post('/', auth, ctrl.upsert);
router.patch('/:id/active', auth, ctrl.toggleActive);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
