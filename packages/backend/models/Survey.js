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
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'signed', 'closed'),
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
  buildingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Buildings',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id'
    }
  },
  engineerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = Survey;