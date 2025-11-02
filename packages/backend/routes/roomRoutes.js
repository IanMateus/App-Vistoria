const express = require('express');
const { 
  createRoom, 
  updateRoomStatus, 
  getSurveyRooms,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { requireEngineerOrAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, requireEngineerOrAdmin, createRoom);
router.get('/survey/:surveyId', protect, getSurveyRooms);
router.put('/:roomId', protect, requireEngineerOrAdmin, updateRoom);
router.put('/:roomId/status', protect, requireEngineerOrAdmin, updateRoomStatus);
router.delete('/:roomId', protect, requireEngineerOrAdmin, deleteRoom);

module.exports = router;