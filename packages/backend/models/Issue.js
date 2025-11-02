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
    allowNull: false // e.g., "Kitchen", "Bathroom", "Living Room"
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  photo: {
    type: DataTypes.STRING, // File path or URL
    allowNull: true
  },
  recommendedAction: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
});

module.exports = Issue;