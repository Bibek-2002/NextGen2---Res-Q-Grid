const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { submitSOS, getMyReports } = require('../controllers/evidenceController');

router.post('/', verifyToken, submitSOS);
router.get('/my-reports', verifyToken, getMyReports);

module.exports = router;
