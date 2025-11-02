const { Room, Issue, Survey } = require('../models/associations');

const createRoom = async (req, res) => {
  try {
    const { surveyId, name, status, notes } = req.body;

    const room = await Room.create({
      surveyId,
      name,
      status: status || 'pending',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room'
    });
  }
};

const updateRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status, notes } = req.body;

    const room = await Room.findByPk(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.update({
      status,
      notes: notes || room.notes
    });

    res.json({
      success: true,
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating room'
    });
  }
};

const getSurveyRooms = async (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const rooms = await Room.findAll({
      where: { surveyId },
      include: [{
        model: Issue,
        as: 'issues'
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms'
    });
  }
};

module.exports = {
  createRoom,
  updateRoomStatus,
  getSurveyRooms
};