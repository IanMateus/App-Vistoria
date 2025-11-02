require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import all models for synchronization
require('./models/User');
require('./models/Building');
require('./models/Client');
require('./models/Survey');
require('./models/Issue');
require('./models/BuildingClient');
require('./models/Room');
require('./models/associations');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/buildings', require('./routes/buildingRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/surveys', require('./routes/surveyRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/linking', require('./routes/linkingRoutes')); // New linking routes
app.use('/api/rooms', require('./routes/roomRoutes')); // New room routes

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Apartment Survey API is running!',
    version: '2.0',
    features: 'Enhanced with client-building linking and room-based surveys',
    endpoints: {
      auth: '/api/auth',
      buildings: '/api/buildings',
      clients: '/api/clients',
      surveys: '/api/surveys',
      issues: '/api/issues',
      reports: '/api/reports',
      linking: '/api/linking',
      rooms: '/api/rooms'
    }
  });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV}`);
  console.log(`💾 Database: SQLite`);
  console.log(`🏢 Enhanced Apartment Survey System Ready!`);
  console.log(`👥 Roles: Client, Engineer, Admin`);
  console.log(`🔗 New: Client-Building linking & Room-based surveys`);
});