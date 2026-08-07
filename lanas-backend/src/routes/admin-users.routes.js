const router = require('express').Router();
const { listUsers, createUser, deleteUser, changePassword, requireSuperadmin } = require('../controllers/admin-users.controller');
const auth = require('../middleware/auth');

router.use(auth, requireSuperadmin);

router.get('/', listUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);
router.patch('/:id/password', changePassword);

module.exports = router;
