const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Survey = sequelize.define('Survey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  surveyDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'signed'),
    defaultValue: 'scheduled'
  },
  clientSignature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  engineerNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  finalReport: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  buildingClientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'BuildingClients',
      key: 'id'
    }
  }
});

module.exports = Survey;