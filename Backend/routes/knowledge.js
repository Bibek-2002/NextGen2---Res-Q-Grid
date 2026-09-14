const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { addKnowledge, getKnowledge } = require('../controllers/knowledgeController');

router.post('/', verifyToken, addKnowledge);
router.get('/', verifyToken, getKnowledge);

module.exports = router;
