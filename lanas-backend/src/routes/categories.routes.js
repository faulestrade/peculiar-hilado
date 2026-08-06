const router = require('express').Router();
const ctrl = require('../controllers/categories.controller');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/', ctrl.getAll);
router.post('/', auth, ctrl.create);
router.post('/:id/image', auth, upload.single('image'), ctrl.uploadImage);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
