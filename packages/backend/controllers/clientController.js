const { Client, User, Building, BuildingClient } = require('../models/associations');

const createClient = async (req, res) => {
  try {
    const { name, email, phone, address, propertyType, propertyNumber, floor, block } = req.body;
    
    console.log('Received client data in backend:', req.body); // ADD THIS LINE

    // Validate required fields
    if (!name || !email || !phone || !address || !propertyNumber) {
      console.log('Receive client data in backend:', req.body)
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos: nome, email, telefone, endereço e número da propriedade'
      });
    }

    // Check if client already exists with this email
    const existingClient = await Client.findOne({ where: { email } });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um cliente com este email'
      });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      propertyType: propertyType || 'apartment',
      propertyNumber,
      floor: propertyType === 'apartment' ? floor : null,
      block: propertyType === 'apartment' ? block : null,
      userId: req.body.userId || null
    });

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Erro de validação: ${messages}`
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Já existe um cliente com este email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente'
    });
  }
};

const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: [{
        model: User,
        as: 'userAccount',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients'
    });
  }
};

// Get client's own profile
const getMyClientProfile = async (req, res) => {
  try {
    const client = await Client.findOne({ 
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'userAccount',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client profile'
    });
  }
};

module.exports = {
  createClient,
  getClients,
  getMyClientProfile
};