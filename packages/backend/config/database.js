const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    
    // Import all models
    require('../models/User');
    require('../models/Building');
    require('../models/Client');
    require('../models/Survey');
    require('../models/Issue');
    require('../models/associations');
    
    // Force sync to recreate tables with new schema
    await sequelize.sync({ force: true });
    
    console.log('✅ SQLite database connected and synced');
    console.log('📊 Models loaded: User, Building, Client, Survey, Issue');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };