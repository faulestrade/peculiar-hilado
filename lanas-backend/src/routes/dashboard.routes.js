const router = require('express').Router();
const { getStats, getRevenue } = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

router.get('/stats', auth, getStats);
router.get('/revenue', auth, getRevenue);

module.exports = router;
