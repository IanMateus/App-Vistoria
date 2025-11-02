const express = require('express');
const { 
  createSurvey, 
  getSurveys, 
  getClientSurveys, 
  updateSurveyStatus, 
  startLiveSurvey,
  getAllSurveys,
  addRoomsToSurvey,
  deleteSurvey
} = require('../controllers/surveyController');
const { protect } = require('../middleware/authMiddleware');
const { requireEngineerOrAdmin, requireClient, requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Engineer/Admin routes
router.post('/', protect, requireEngineerOrAdmin, createSurvey);
router.get('/', protect, requireEngineerOrAdmin, getSurveys);
router.put('/:surveyId', protect, requireEngineerOrAdmin, updateSurveyStatus);
router.put('/:surveyId/start-live', protect, requireEngineerOrAdmin, startLiveSurvey);
router.post('/:surveyId/rooms', protect, requireEngineerOrAdmin, addRoomsToSurvey);
router.delete('/:surveyId', protect, requireEngineerOrAdmin, deleteSurvey);

// Admin only - get all surveys
router.get('/all', protect, requireAdmin, getAllSurveys);

// Client routes
router.get('/client', protect, requireClient, getClientSurveys);

module.exports = router;