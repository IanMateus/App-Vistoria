const express = require('express');
const { createIssue, getSurveyIssues } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createIssue);
router.get('/survey/:surveyId', protect, getSurveyIssues);

module.exports = router;