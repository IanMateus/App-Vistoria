const { Survey, Building, Client, Issue, User } = require('../models/associations');

const generateSurveyReport = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findByPk(surveyId, {
      include: [
        { model: Building, as: 'building' },
        { model: Client, as: 'client' },
        { model: User, as: 'engineer', attributes: ['id', 'name', 'company', 'licenseNumber'] },
        { model: Issue, as: 'issues' }
      ]
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check permissions - client can only access their own surveys
    if (req.user.role === 'client') {
      const clientProfile = await Client.findOne({ where: { userId: req.user.id } });
      if (!clientProfile || survey.clientId !== clientProfile.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this survey'
        });
      }
    }

    // For now, return JSON data - you can implement PDF generation later
    const reportData = {
      surveyId: survey.id,
      surveyDate: survey.surveyDate,
      status: survey.status,
      building: survey.building,
      client: survey.client,
      engineer: survey.engineer,
      issues: survey.issues,
      engineerNotes: survey.engineerNotes,
      finalReport: survey.finalReport,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Survey report generated successfully',
      report: reportData,
      downloadUrl: `/api/reports/survey/${surveyId}/pdf` // Placeholder for PDF download
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating survey report'
    });
  }
};

// Placeholder for PDF generation
const downloadSurveyPDF = async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    // In a real implementation, you would generate a PDF here
    // For now, return a success message
    res.json({
      success: true,
      message: 'PDF download functionality will be implemented soon',
      surveyId: surveyId
    });
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF'
    });
  }
};

module.exports = {
  generateSurveyReport,
  downloadSurveyPDF
};