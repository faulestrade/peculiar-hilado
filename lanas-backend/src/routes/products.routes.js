const router = require('express').Router();
const ctrl = require('../controllers/products.controller');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// Públicas
router.get('/', ctrl.getAll);
router.get('/:slug', ctrl.getOne);

// Protegidas (backoffice)
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);
router.post('/:id/images', auth, upload.single('image'), ctrl.uploadImage);
router.delete('/images/:imageId', auth, ctrl.deleteImage);
router.patch('/variants/:variantId/stock', auth, ctrl.updateVariantStock);

module.exports = router;
