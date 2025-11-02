const express = require('express');
const { linkClientToBuilding, getClientBuildings, getBuildingClients } = require('../controllers/linkingController');
const { protect } = require('../middleware/authMiddleware');
const { requireEngineerOrAdmin, requireClient } = require('../middleware/roleMiddleware');

const router = express.Router();

// Engineer/Admin routes
router.post('/link-client', protect, requireEngineerOrAdmin, linkClientToBuilding);
router.get('/building/:buildingId/clients', protect, requireEngineerOrAdmin, getBuildingClients);

// Client routes
router.get('/my-buildings', protect, requireClient, getClientBuildings);

module.exports = router;