const { Issue, Room, Survey } = require('../models/associations');

const createIssue = async (req, res) => {
  try {
    const { roomId, surveyId, area, description, severity, photo, recommendedAction, estimatedCost } = req.body;

    const issue = await Issue.create({
      roomId,
      surveyId,
      area,
      description,
      severity: severity || 'medium',
      photo: photo || null,
      recommendedAction: recommendedAction || null,
      estimatedCost: estimatedCost || null
    });

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating issue'
    });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { area, description, severity, status, photo, recommendedAction, estimatedCost } = req.body;

    const issue = await Issue.findByPk(issueId);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    await issue.update({
      area: area || issue.area,
      description: description || issue.description,
      severity: severity || issue.severity,
      status: status || issue.status,
      photo: photo || issue.photo,
      recommendedAction: recommendedAction || issue.recommendedAction,
      estimatedCost: estimatedCost || issue.estimatedCost
    });

    res.json({
      success: true,
      message: 'Issue updated successfully',
      issue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating issue'
    });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findByPk(issueId);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    await issue.destroy();

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting issue'
    });
  }
};

const getSurveyIssues = async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const issues = await Issue.findAll({
      where: { surveyId },
      include: [{
        model: Room,
        as: 'issueRoom'
      }],
      order: [['createdAt', 'ASC']]
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
  updateIssue,
  deleteIssue,
  getSurveyIssues
};