const express = require('express');
const { createRoom, updateRoomStatus, getSurveyRooms } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { requireEngineerOrAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, requireEngineerOrAdmin, createRoom);
router.put('/:roomId', protect, requireEngineerOrAdmin, updateRoomStatus);
router.get('/survey/:surveyId', protect, getSurveyRooms);

module.exports = router;