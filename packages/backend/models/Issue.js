const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'fixed', 'wont_fix'),
    defaultValue: 'pending'
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recommendedAction: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Rooms',
      key: 'id'
    }
  },
  surveyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Surveys',
      key: 'id'
    }
  }
});

module.exports = Issue;