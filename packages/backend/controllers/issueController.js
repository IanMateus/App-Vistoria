const { Issue } = require('../models/associations');

const createIssue = async (req, res) => {
  try {
    const { surveyId, area, description, severity, recommendedAction, estimatedCost } = req.body;
    
    const issue = await Issue.create({
      surveyId,
      area,
      description,
      severity,
      recommendedAction,
      estimatedCost
    });

    res.status(201).json({
      success: true,
      message: 'Issue recorded successfully',
      issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording issue'
    });
  }
};

const getSurveyIssues = async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const issues = await Issue.findAll({
      where: { surveyId },
      order: [['severity', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues'
    });
  }
};

module.exports = {
  createIssue,
  getSurveyIssues
};