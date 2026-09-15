const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getIncidents, getIncidentById } = require('../controllers/incidentController');

router.get('/', verifyToken, requireRole('RescueTeam', 'Admin'), getIncidents);
router.get('/:id', verifyToken, requireRole('RescueTeam', 'Admin'), getIncidentById);

module.exports = router;
