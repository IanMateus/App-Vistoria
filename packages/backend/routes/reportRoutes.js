const express = require('express');
const { generateSurveyReport, downloadSurveyPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/survey/:surveyId', protect, generateSurveyReport);
router.get('/survey/:surveyId/pdf', protect, downloadSurveyPDF);

module.exports = router;