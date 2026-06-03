const router = require('express').Router();
const ctrl = require('../controllers/orders.controller');
const auth = require('../middleware/auth');

// Pública: crear pedido desde la tienda
router.post('/', ctrl.create);

// Protegidas: gestión desde backoffice
router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, ctrl.getOne);
router.patch('/:id/status', auth, ctrl.updateStatus);

module.exports = router;
