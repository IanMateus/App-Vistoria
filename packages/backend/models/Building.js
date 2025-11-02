const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Building = sequelize.define('Building', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  constructionCompany: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numberOfFloors: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numberOfUnits: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Building;