const API_BASE_URL = "/api";

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const surveyAppService = {
  // Buildings
  async getBuildings() {
    const response = await fetch(`${API_BASE_URL}/buildings`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch buildings');
    }

    return data.buildings;
  },

  async getClientBuildings() {
    const response = await fetch(`${API_BASE_URL}/linking/my-buildings`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch buildings');
    }

    return data.buildings;
  },

  async createBuilding(buildingData) {
    const response = await fetch(`${API_BASE_URL}/buildings`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(buildingData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create building');
    }

    return data.building;
  },

  // Clients
  async getClients() {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch clients');
    }

    return data.clients;
  },

  async getBuildingClients(buildingId) {
    const response = await fetch(`${API_BASE_URL}/linking/building/${buildingId}/clients`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch building clients');
    }

    return data.clients;
  },

  async createClient(clientData) {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(clientData)
    });

    const data = await response.json();

    if (!response.ok) {
      // Improved error handling to show backend validation messages
      const errorMessage = data.message || 'Failed to create client';
      console.error('Client creation error:', data);
      throw new Error(errorMessage);
    }

    return data.client;
  },

  // Linking
  async linkClientToBuilding(linkData) {
    const response = await fetch(`${API_BASE_URL}/linking/link-client`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(linkData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to link client to building');
    }

    return data.link;
  },

  // Surveys
  async getSurveys() {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch surveys');
    }

    return data.surveys;
  },

  async getAllSurveys() {
    const response = await fetch(`${API_BASE_URL}/surveys/all`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch all surveys');
    }

    return data.surveys;
  },

  async getClientSurveys() {
    const response = await fetch(`${API_BASE_URL}/surveys/client`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch surveys');
    }

    return data.surveys;
  },

  async createSurvey(surveyData) {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(surveyData)
    });

    const data = await response.json();

    if (!response.ok) {
      // Improved error handling to show backend validation messages
      const errorMessage = data.message || 'Failed to create survey';
      console.error('Survey creation error:', data);
      throw new Error(errorMessage);
    }

    return data.survey;
  },

  async startLiveSurvey(surveyId) {
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}/start-live`, {
      method: 'PUT',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to start live survey');
    }

    return data.survey;
  },

  async updateSurvey(surveyId, updateData) {
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update survey');
    }

    return data.survey;
  },

  // Rooms - NEW FUNCTION for adding multiple rooms to a survey
  async addRoomsToSurvey(surveyId, rooms) {
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}/rooms`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ rooms })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add rooms to survey');
    }

    return data.rooms;
  },

  async createRoom(roomData) {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(roomData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create room');
    }

    return data.room;
  },

  // Add to your existing service functions:

// Room management
async updateRoom(roomId, updateData) {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updateData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update room');
  }

  return data.room;
},

async deleteRoom(roomId) {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete room');
  }

  return data;
},

// Issue management
async createIssue(issueData) {
  const response = await fetch(`${API_BASE_URL}/issues`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(issueData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create issue');
  }

  return data.issue;
},

async updateIssue(issueId, updateData) {
  const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updateData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update issue');
  }

  return data.issue;
},

async deleteIssue(issueId) {
  const response = await fetch(`${API_BASE_URL}/issues/${issueId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete issue');
  }

  return data;
},

async getSurveyIssues(surveyId) {
  const response = await fetch(`${API_BASE_URL}/issues/survey/${surveyId}`, {
    headers: getAuthHeader()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch issues');
  }

  return data.issues;
},

// Survey deletion
async deleteSurvey(surveyId) {
  const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete survey');
  }

  return data;
},

  async updateRoomStatus(roomId, updateData) {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updateData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update room');
    }

    return data.room;
  },

  async getSurveyRooms(surveyId) {
    const response = await fetch(`${API_BASE_URL}/rooms/survey/${surveyId}`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch rooms');
    }

    return data.rooms;
  },

  // Issues
  async getIssuesBySurvey(surveyId) {
    const response = await fetch(`${API_BASE_URL}/issues/survey/${surveyId}`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch issues');
    }

    return data.issues;
  },

  async createIssue(issueData) {
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(issueData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create issue');
    }

    return data.issue;
  },

  // Reports
  async generateSurveyReport(surveyId) {
    const response = await fetch(`${API_BASE_URL}/reports/survey/${surveyId}`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate report');
    }

    return data.report;
  },

  async downloadSurveyPDF(surveyId) {
    const response = await fetch(`${API_BASE_URL}/reports/survey/${surveyId}/pdf`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to download PDF');
    }

    return data;
  }
};