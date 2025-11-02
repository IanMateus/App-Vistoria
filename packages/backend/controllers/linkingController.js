const { Building, Client, BuildingClient, User } = require('../models/associations');

const linkClientToBuilding = async (req, res) => {
  try {
    const { clientEmail, buildingId } = req.body;

    // Find client by email
    const client = await Client.findOne({ where: { email: clientEmail } });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Link client to building (no apartment details needed)
    const buildingClient = await BuildingClient.create({
      clientId: client.id,
      buildingId
    });

    res.status(201).json({
      success: true,
      message: 'Client linked to building successfully',
      link: buildingClient
    });
  } catch (error) {
    console.error('Link client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error linking client to building'
    });
  }
};

const getClientBuildings = async (req, res) => {
  try {
    const client = await Client.findOne({ 
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }

    const buildingClients = await BuildingClient.findAll({
      where: { clientId: client.id },
      include: [
        { 
          model: Building, 
          as: 'Building',
          attributes: ['id', 'name', 'address', 'constructionCompany']
        }
      ]
    });

    res.json({
      success: true,
      buildings: buildingClients
    });
  } catch (error) {
    console.error('Get client buildings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client buildings'
    });
  }
};

const getBuildingClients = async (req, res) => {
  try {
    const { buildingId } = req.params;

    const buildingClients = await BuildingClient.findAll({
      where: { buildingId },
      include: [
        { 
          model: Client, 
          as: 'Client',
          attributes: ['id', 'name', 'email', 'phone', 'propertyType', 'propertyNumber', 'floor', 'block']
        }
      ]
    });

    res.json({
      success: true,
      clients: buildingClients
    });
  } catch (error) {
    console.error('Get building clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching building clients'
    });
  }
};

module.exports = {
  linkClientToBuilding,
  getClientBuildings,
  getBuildingClients
};