const { Building } = require('../models/associations');

const createBuilding = async (req, res) => {
  try {
    const { name, address, constructionCompany, numberOfFloors, numberOfUnits } = req.body;
    
    const building = await Building.create({
      name,
      address,
      constructionCompany,
      numberOfFloors,
      numberOfUnits
    });

    res.status(201).json({
      success: true,
      message: 'Building created successfully',
      building
    });
  } catch (error) {
    console.error('Create building error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating building'
    });
  }
};

const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: buildings.length,
      buildings
    });
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buildings'
    });
  }
};

// Get buildings for clients (only buildings where they have surveys)
const getClientBuildings = async (req, res) => {
  try {
    // This would require joining through surveys to find buildings related to client
    // For now, return all buildings (you can implement the join later)
    const buildings = await Building.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      count: buildings.length,
      buildings
    });
  } catch (error) {
    console.error('Get client buildings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching buildings'
    });
  }
};

module.exports = {
  createBuilding,
  getBuildings,
  getClientBuildings
};