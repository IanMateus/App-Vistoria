const express = require('express');
const { createClient, getClients, getMyClientProfile } = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');
const { requireEngineerOrAdmin, requireClient } = require('../middleware/roleMiddleware');

const router = express.Router();

// Engineer/Admin only routes
router.post('/', protect, requireEngineerOrAdmin, createClient);
router.get('/', protect, requireEngineerOrAdmin, getClients);

// Client route - get their own profile
router.get('/profile', protect, requireClient, getMyClientProfile);

module.exports = router;