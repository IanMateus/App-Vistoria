const User = require('./User');
const Building = require('./Building');
const Client = require('./Client');
const Survey = require('./Survey');
const Issue = require('./Issue');
const BuildingClient = require('./BuildingClient');
const Room = require('./Room');

// User associations
User.hasMany(Survey, { foreignKey: 'engineerId', as: 'conductedSurveys' });
User.hasOne(Client, { foreignKey: 'userId', as: 'clientProfile' });

// Building associations
Building.hasMany(Survey, { foreignKey: 'buildingId', as: 'buildingSurveys' });
Building.belongsToMany(Client, { 
  through: BuildingClient, 
  as: 'buildingClients',  // Changed from 'clients'
  foreignKey: 'buildingId'
});

// Client associations
Client.belongsTo(User, { foreignKey: 'userId', as: 'userAccount' });
Client.belongsToMany(Building, { 
  through: BuildingClient, 
  as: 'clientBuildings',  // Changed from 'buildings'
  foreignKey: 'clientId'
});
Client.hasMany(Survey, { foreignKey: 'clientId', as: 'clientSurveys' });  // Changed from 'surveys'

// BuildingClient associations
BuildingClient.belongsTo(Building, { foreignKey: 'buildingId' });
BuildingClient.belongsTo(Client, { foreignKey: 'clientId' });
BuildingClient.hasMany(Survey, { foreignKey: 'buildingClientId', as: 'locationSurveys' });  // Changed from 'surveys'

// Survey associations
Survey.belongsTo(Building, { foreignKey: 'buildingId', as: 'surveyBuilding' });  // Changed from 'building'
Survey.belongsTo(Client, { foreignKey: 'clientId', as: 'surveyClient' });  // Changed from 'client'
Survey.belongsTo(User, { foreignKey: 'engineerId', as: 'surveyEngineer' });  // Changed from 'engineer'
Survey.belongsTo(BuildingClient, { 
  foreignKey: 'buildingClientId', 
  as: 'surveyLocation'  // Changed from 'location'
});
Survey.hasMany(Room, { foreignKey: 'surveyId', as: 'surveyRooms' });  // Changed from 'rooms'
Survey.hasMany(Issue, { foreignKey: 'surveyId', as: 'surveyIssues' });  // Changed from 'issues'

// Room associations
Room.belongsTo(Survey, { foreignKey: 'surveyId', as: 'roomSurvey' });  // Changed from 'survey'
Room.hasMany(Issue, { foreignKey: 'roomId', as: 'roomIssues' });  // Changed from 'issues'

// Issue associations
Issue.belongsTo(Survey, { foreignKey: 'surveyId', as: 'issueSurvey' });  // Changed from 'survey'
Issue.belongsTo(Room, { foreignKey: 'roomId', as: 'issueRoom' });  // Changed from 'room'

module.exports = {
  User,
  Building,
  Client,
  Survey,
  Issue,
  BuildingClient,
  Room
};