const { validationResult } = require('express-validator');
const { User, Client, Building, BuildingClient } = require('../models/associations');
const { generateToken } = require('../middleware/authMiddleware');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, licenseNumber, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate role
    const validRoles = ['client', 'engineer', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be client, engineer, or admin'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
      licenseNumber,
      company
    });

    // If registering as client, check if client record exists and link them
    if (role === 'client') {
      const existingClient = await Client.findOne({ where: { email } });
      
      if (existingClient) {
        // Update client record with user ID
        await existingClient.update({ 
          userId: user.id,
          name: name, // Update name from registration
          phone: existingClient.phone !== 'Pending' ? existingClient.phone : 'Not provided',
          address: existingClient.address !== 'Pending' ? existingClient.address : 'Not provided'
        });

        console.log(`✅ Linked existing client ${email} to user account`);
      } else {
        // Create new client profile
        await Client.create({
          name,
          email,
          phone: 'Not provided',
          address: 'Not provided',
          apartmentNumber: 'Not provided',
          userId: user.id
        });
      }
    }

    // Generate token
    const token = generateToken(user.id);

    // Fetch complete user data with associations
    // In the register function, update the include part:
    const userWithProfile = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Client,
        as: 'clientProfile',
        include: [{
          model: Building,
          as: 'clientBuildings',  // Changed from 'buildings'
          through: { attributes: [] }  // No attributes from junction table needed
        }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithProfile,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Database schema error. Please contact administrator.'
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists in the system'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        licenseNumber: user.licenseNumber,
        company: user.company
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        licenseNumber: user.licenseNumber,
        company: user.company
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all users (for admin only)
// @route   GET /api/auth/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getUsers
};