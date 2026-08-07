const router = require('express').Router();
const ctrl = require('../controllers/products.controller');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

const optionalAuth = (req, res, next) => {
  const header = req.headers['authorization'];
  if (header?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      req.admin = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    } catch {}
  }
  next();
};

// Públicas
router.get('/', optionalAuth, ctrl.getAll);
router.get('/:slug', ctrl.getOne);

// Protegidas (backoffice)
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, ctrl.remove);
router.post('/:id/images', auth, upload.single('image'), ctrl.uploadImage);
router.delete('/images/:imageId', auth, ctrl.deleteImage);
router.patch('/variants/:variantId/stock', auth, ctrl.updateVariantStock);
router.patch('/:id/active', auth, ctrl.toggleActive);

module.exports = router;
