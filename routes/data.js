const router = require('express').Router();
const auth = require('../middleware/auth');
const { exportData, exportBoard, importData } = require('../controllers/dataController');

router.use(auth);

router.get('/export', exportData);
router.get('/export/:id', exportBoard);
router.post('/import', importData);

module.exports = router;
