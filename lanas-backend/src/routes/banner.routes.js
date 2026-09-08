const router = require('express').Router();
const ctrl = require('../controllers/banner.controller');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/active', ctrl.getActive);
router.get('/', auth, ctrl.getAll);
router.post('/', auth, ctrl.upsert);
router.post('/:id/image', auth, upload.single('image'), ctrl.uploadImage);
router.patch('/:id/active', auth, ctrl.toggleActive);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
