const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
    volunteerUpdate, hospitalUpdate, ngoInventoryUpdate, campStatusUpdate
} = require('../controllers/updateController');

router.post('/volunteer-update', verifyToken, requireRole('Volunteer'), volunteerUpdate);
router.post('/hospital-update', verifyToken, requireRole('Hospital'), hospitalUpdate);
router.post('/ngo-inventory', verifyToken, requireRole('NGO'), ngoInventoryUpdate);
router.post('/camp-status', verifyToken, requireRole('Camp'), campStatusUpdate);

module.exports = router;
