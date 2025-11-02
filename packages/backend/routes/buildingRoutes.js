const express = require('express');
const { createBuilding, getBuildings, getClientBuildings } = require('../controllers/buildingController');
const { protect } = require('../middleware/authMiddleware');
const { requireEngineerOrAdmin, requireClient } = require('../middleware/roleMiddleware');

const router = express.Router();

// Engineer/Admin only routes
router.post('/', protect, requireEngineerOrAdmin, createBuilding);
router.get('/', protect, requireEngineerOrAdmin, getBuildings);

// Client route - only their buildings
router.get('/client', protect, requireClient, getClientBuildings);

module.exports = router;