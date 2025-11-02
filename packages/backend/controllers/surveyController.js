const { Survey, Building, Client, BuildingClient, Room, Issue, User } = require('../models/associations');

const createSurvey = async (req, res) => {
  try {
    const { buildingId, clientId, surveyDate, engineerNotes } = req.body;
    
    // Validate required fields
    if (!buildingId || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Building ID and Client ID are required'
      });
    }

    // Verify building exists
    const building = await Building.findByPk(buildingId);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Building not found'
      });
    }

    // Verify client exists
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if client has all required data
    const missingFields = [];
    if (!client.name) missingFields.push('nome');
    if (!client.email) missingFields.push('email');
    if (!client.phone) missingFields.push('telefone');
    if (!client.address) missingFields.push('endereço');
    if (!client.propertyNumber) missingFields.push('número da propriedade');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cliente com campos obrigatórios faltando: ${missingFields.join(', ')}`
      });
    }

    // Create the survey
    const survey = await Survey.create({
      buildingId: buildingId,
      clientId: clientId,
      engineerId: req.user.id,
      surveyDate: surveyDate || new Date(),
      engineerNotes: engineerNotes,
      status: 'scheduled'
    });

    // Fetch the created survey with related data
    const createdSurvey = await Survey.findByPk(survey.id, {
      include: [
        { model: Building, as: 'surveyBuilding' },
        { model: Client, as: 'surveyClient' },
        { model: User, as: 'surveyEngineer' },
        { model: Room, as: 'surveyRooms' },
        { model: Issue, as: 'surveyIssues' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      survey: createdSurvey
    });
  } catch (error) {
    console.error('Create survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating survey: ' + error.message
    });
  }
};

const deleteSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findByPk(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Check if the user owns the survey or is admin
    if (survey.engineerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this survey'
      });
    }

    await survey.destroy();

    res.json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error('Delete survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting survey'
    });
  }
};

// Get surveys for engineers/admins (all surveys they created)
const getSurveys = async (req, res) => {
  try {
    const surveys = await Survey.findAll({
      where: { engineerId: req.user.id },
      include: [
        { model: Building, as: 'surveyBuilding' },
        { model: Client, as: 'surveyClient' },
        { model: Room, as: 'surveyRooms' },
        { model: Issue, as: 'surveyIssues' }
      ],
      order: [['surveyDate', 'DESC']]
    });

    res.json({
      success: true,
      count: surveys.length,
      surveys
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching surveys'
    });
  }
};

// Get surveys for clients (only surveys linked to their client profile)
const getClientSurveys = async (req, res) => {
  try {
    // First, find the client profile for this user
    const clientProfile = await Client.findOne({ 
      where: { userId: req.user.id }
    });

    if (!clientProfile) {
      return res.json({
        success: true,
        count: 0,
        surveys: []
      });
    }

    const surveys = await Survey.findAll({
      where: { clientId: clientProfile.id },
      include: [
        { model: Building, as: 'surveyBuilding' },
        { model: Client, as: 'surveyClient' },
        { model: User, as: 'surveyEngineer', attributes: ['id', 'name', 'company', 'licenseNumber'] },
        { model: Room, as: 'surveyRooms' },
        { model: Issue, as: 'surveyIssues' }
      ],
      order: [['surveyDate', 'DESC']]
    });

    res.json({
      success: true,
      count: surveys.length,
      surveys
    });
  } catch (error) {
    console.error('Get client surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching surveys'
    });
  }
};

const updateSurveyStatus = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { status, clientSignature, finalReport } = req.body;
    
    const survey = await Survey.findByPk(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    await survey.update({
      status,
      clientSignature,
      finalReport
    });

    res.json({
      success: true,
      message: 'Survey updated successfully',
      survey
    });
  } catch (error) {
    console.error('Update survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating survey'
    });
  }
};

// Start live survey
const startLiveSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const survey = await Survey.findByPk(surveyId);
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Verify the engineer owns this survey
    if (survey.engineerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this survey'
      });
    }

    await survey.update({
      status: 'in_progress',
      surveyDate: new Date()
    });

    res.json({
      success: true,
      message: 'Live survey started successfully',
      survey
    });
  } catch (error) {
    console.error('Start live survey error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting live survey'
    });
  }
};

// Get all surveys for admin
const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.findAll({
      include: [
        { model: Building, as: 'surveyBuilding' },
        { model: Client, as: 'surveyClient' },
        { model: User, as: 'surveyEngineer', attributes: ['id', 'name', 'company'] },
        { model: Room, as: 'surveyRooms' },
        { model: Issue, as: 'surveyIssues' }
      ],
      order: [['surveyDate', 'DESC']]
    });

    res.json({
      success: true,
      count: surveys.length,
      surveys
    });
  } catch (error) {
    console.error('Get all surveys error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching surveys'
    });
  }
};

// Add rooms to survey
const addRoomsToSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { rooms } = req.body;

    const survey = await Survey.findByPk(surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Create rooms for this survey
    const createdRooms = await Room.bulkCreate(
      rooms.map(room => ({
        ...room,
        surveyId,
        status: 'pending'
      }))
    );

    res.json({
      success: true,
      message: 'Rooms added successfully',
      rooms: createdRooms
    });
  } catch (error) {
    console.error('Add rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding rooms to survey'
    });
  }
};

module.exports = {
  createSurvey,
  getSurveys,
  getClientSurveys,
  updateSurveyStatus,
  startLiveSurvey,
  getAllSurveys,
  addRoomsToSurvey,
  deleteSurvey
};