const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BuildingClient = sequelize.define('BuildingClient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
  // Removed apartment details since they're now in Client
});

module.exports = BuildingClient;