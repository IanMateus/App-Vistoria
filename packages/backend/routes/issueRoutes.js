const express = require('express');
const { 
  createIssue, 
  updateIssue, 
  deleteIssue, 
  getSurveyIssues 
} = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const { requireEngineerOrAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, requireEngineerOrAdmin, createIssue);
router.get('/survey/:surveyId', protect, getSurveyIssues);
router.put('/:issueId', protect, requireEngineerOrAdmin, updateIssue);
router.delete('/:issueId', protect, requireEngineerOrAdmin, deleteIssue);

module.exports = router;