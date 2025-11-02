import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../../services/surveyApp';

const SimpleSurveyWizard = ({ onSurveyCreated, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data
  const [buildings, setBuildings] = useState([]);
  const [clients, setClients] = useState([]);
  
  // Selected values
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [surveyDetails, setSurveyDetails] = useState({
    surveyDate: '',
    engineerNotes: ''
  });

  // New building form
  const [newBuilding, setNewBuilding] = useState({
    name: '',
    address: '',
    constructionCompany: '',
    numberOfFloors: '',
    numberOfUnits: ''
  });

  // New client form - with default property number
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    propertyType: 'apartment',
    propertyNumber: '1', // Default value to prevent null
    floor: '',
    block: ''
  });

  // Fetch data
  const fetchBuildings = async () => {
    try {
      const buildingsData = await surveyAppService.getBuildings();
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const clientsData = await surveyAppService.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Create new building
  const createNewBuilding = async () => {
    try {
      const building = await surveyAppService.createBuilding(newBuilding);
      setBuildings(prev => [...prev, building]);
      setSelectedBuilding(building);
      return building;
    } catch (error) {
      console.error('Error creating building:', error);
      throw error;
    }
  };

  // Create new client - with validation
  const createNewClient = async () => {
    try {
      // Validate required fields
      if (!newClient.name || !newClient.email || !newClient.phone || !newClient.address || !newClient.propertyNumber) {
        console.log('Missing fields:', {
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
        propertyNumber: newClient.propertyNumber
      });
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      console.log('Sending client data to backend:', newClient); // ADD THIS LINE

      const client = await surveyAppService.createClient(newClient);
      setClients(prev => [...prev, client]);
      setSelectedClient(client);
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  // Link client to building
  const linkClientToBuilding = async (clientId, buildingId) => {
    try {
      const client = selectedClient || newClient;
      await surveyAppService.linkClientToBuilding({
        clientEmail: client.email,
        buildingId: buildingId
      });
    } catch (error) {
      console.error('Error linking client to building:', error);
      // Don't throw error here - linking might already exist and that's OK
    }
  };

  // Create survey
  const createSurvey = async (clientId, buildingId) => {
    try {
      const survey = await surveyAppService.createSurvey({
        clientId: clientId,
        buildingId: buildingId,
        surveyDate: surveyDetails.surveyDate,
        engineerNotes: surveyDetails.engineerNotes
      });
      return survey;
    } catch (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
  };

    // Handle final submission
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        let finalBuilding = selectedBuilding;
        let finalClient = selectedClient;

        // Create building if new building was filled AND no building is selected
        if (newBuilding.name && !selectedBuilding) {
        finalBuilding = await createNewBuilding();
        }

        // Create client if new client was filled AND no client is selected
        if (newClient.name && !selectedClient) {
        finalClient = await createNewClient();
        }

        // Validate we have both building and client
        if (!finalBuilding) {
        throw new Error('Selecione ou cadastre um edifício');
        }

        if (!finalClient) {
        throw new Error('Selecione ou cadastre um cliente');
        }

        // Link client to building (this might already exist, which is fine)
        try {
        await linkClientToBuilding(finalClient.id, finalBuilding.id);
        } catch (linkError) {
        console.log('Link might already exist, continuing...', linkError.message);
        // Continue even if link already exists
        }

        // Create survey
        const survey = await createSurvey(finalClient.id, finalBuilding.id);

        alert('✅ Vistoria criada com sucesso!');
        onSurveyCreated(survey);
        
    } catch (error) {
        console.error('Error in survey creation:', error);
        setError(error.message || 'Erro ao criar vistoria');
    } finally {
        setLoading(false);
    }
    };

  // Input handlers
  const handleNewBuildingChange = (field) => (e) => {
    setNewBuilding(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNewClientChange = (field) => (e) => {
    setNewClient(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSurveyDetailsChange = (field) => (e) => {
    setSurveyDetails(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Step navigation
  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // Reset selections when switching to "create new"
  const handleBuildingSelection = (building) => {
    setSelectedBuilding(building);
    setNewBuilding({
      name: '',
      address: '',
      constructionCompany: '',
      numberOfFloors: '',
      numberOfUnits: ''
    });
  };

  const handleClientSelection = (client) => {
    setSelectedClient(client);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      propertyType: 'apartment',
      propertyNumber: '1', // Reset to default
      floor: '',
      block: ''
    });
  };

  // Check if we can proceed to next step
  const canProceedToStep2 = () => {
    return selectedBuilding || newBuilding.name;
  };

    const canProceedToStep3 = () => {
    // If we have a selected client, we can proceed
    if (selectedClient) {
    return true;
    }

    // If we're creating a new client, check all required fields
    if (newClient.name && newClient.email && newClient.phone && newClient.address && newClient.propertyNumber) {
    return true;
    }

    return false;
    };

  useEffect(() => {
    fetchBuildings();
    fetchClients();
  }, []);

  // Step 1: Building Selection
  const renderStep1 = () => (
    <div className="wizard-step">
      <h3>🏢 Selecionar Edifício</h3>
      <p className="step-description">
        Escolha um edifício existente ou cadastre um novo.
      </p>

      <div className="selection-options">
        {/* Existing Buildings */}
        <div className="option-section">
          <h4>📋 Edifícios Cadastrados</h4>
          <div className="options-grid">
            {buildings.map(building => (
              <div
                key={building.id}
                className={`option-card ${selectedBuilding?.id === building.id ? 'selected' : ''}`}
                onClick={() => handleBuildingSelection(building)}
              >
                <h5>{building.name}</h5>
                <p><strong>Endereço:</strong> {building.address}</p>
                <p><strong>Construtora:</strong> {building.constructionCompany}</p>
                <p><strong>Andares:</strong> {building.numberOfFloors} | <strong>Unidades:</strong> {building.numberOfUnits}</p>
              </div>
            ))}
          </div>

          {buildings.length === 0 && (
            <div className="empty-options">
              <p>Nenhum edifício cadastrado ainda.</p>
            </div>
          )}
        </div>

        {/* New Building Form */}
        <div className="option-section">
          <h4>🏗️ Cadastrar Novo Edifício</h4>
          <div className="option-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Nome do edifício *"
                value={newBuilding.name}
                onChange={handleNewBuildingChange('name')}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Endereço completo *"
                value={newBuilding.address}
                onChange={handleNewBuildingChange('address')}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Construtora *"
                value={newBuilding.constructionCompany}
                onChange={handleNewBuildingChange('constructionCompany')}
                className="form-input"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Nº de andares *"
                  value={newBuilding.numberOfFloors}
                  onChange={handleNewBuildingChange('numberOfFloors')}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Nº de unidades *"
                  value={newBuilding.numberOfUnits}
                  onChange={handleNewBuildingChange('numberOfUnits')}
                  className="form-input"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wizard-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceedToStep2()}
          className="btn-primary"
        >
          Continuar →
        </button>
      </div>
    </div>
  );

    // Step 2: Client Selection
    const renderStep2 = () => (
    <div className="wizard-step">
        <h3>👤 Selecionar Cliente</h3>
        <p className="step-description">
        Escolha um cliente existente <strong>OU</strong> preencha os dados para cadastrar um novo.
        </p>

        <div className="selection-options">
        {/* Existing Clients */}
        <div className="option-section">
            <h4>📋 Clientes Cadastrados</h4>
            <p className="section-help">Clique em um cliente existente para selecioná-lo</p>
            <div className="options-grid">
            {clients.map(client => (
                <div
                key={client.id}
                className={`option-card ${selectedClient?.id === client.id ? 'selected' : ''}`}
                onClick={() => handleClientSelection(client)}
                >
                <h5>{client.name}</h5>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Telefone:</strong> {client.phone}</p>
                <p><strong>Propriedade:</strong> {client.propertyNumber} ({client.propertyType === 'apartment' ? 'Apartamento' : 'Casa'})</p>
                {client.floor && <p><strong>Andar:</strong> {client.floor}</p>}
                {client.block && <p><strong>Bloco:</strong> {client.block}</p>}
                </div>
            ))}
            </div>

            {clients.length === 0 && (
            <div className="empty-options">
                <p>Nenhum cliente cadastrado ainda.</p>
                <p><strong>Preencha os dados ao lado para criar o primeiro cliente.</strong></p>
            </div>
            )}
        </div>

        {/* New Client Form */}
        <div className="option-section">
            <h4>🆕 Cadastrar Novo Cliente</h4>
            <p className="section-help">Preencha todos os campos obrigatórios (*)</p>
            <div className="option-form">
            <div className="form-group">
                <input
                type="text"
                placeholder="Nome completo *"
                value={newClient.name}
                onChange={handleNewClientChange('name')}
                className="form-input"
                required
                />
            </div>
            <div className="form-group">
                <input
                type="email"
                placeholder="Email *"
                value={newClient.email}
                onChange={handleNewClientChange('email')}
                className="form-input"
                required
                />
            </div>
            <div className="form-group">
                <input
                type="text"
                placeholder="Telefone *"
                value={newClient.phone}
                onChange={handleNewClientChange('phone')}
                className="form-input"
                required
                />
            </div>
            <div className="form-group">
                <input
                type="text"
                placeholder="Endereço residencial *"
                value={newClient.address}
                onChange={handleNewClientChange('address')}
                className="form-input"
                required
                />
            </div>

            {/* Property Type */}
            <div className="form-group">
                <label>Tipo de Propriedade *:</label>
                <div className="radio-group">
                <label className="radio-option">
                    <input
                    type="radio"
                    value="apartment"
                    checked={newClient.propertyType === 'apartment'}
                    onChange={(e) => setNewClient(prev => ({ ...prev, propertyType: e.target.value }))}
                    />
                    <span>🏢 Apartamento</span>
                </label>
                <label className="radio-option">
                    <input
                    type="radio"
                    value="house"
                    checked={newClient.propertyType === 'house'}
                    onChange={(e) => setNewClient(prev => ({ ...prev, propertyType: e.target.value }))}
                    />
                    <span>🏠 Casa</span>
                </label>
                </div>
            </div>

            {/* Property Details */}
            <div className="form-group">
                <input
                type="text"
                placeholder={newClient.propertyType === 'apartment' ? 'Número do apartamento *' : 'Número da casa *'}
                value={newClient.propertyNumber}
                onChange={handleNewClientChange('propertyNumber')}
                className="form-input"
                required
                />
            </div>

            {/* Only show floor and block for apartments */}
            {newClient.propertyType === 'apartment' && (
                <div className="form-row">
                <div className="form-group">
                    <input
                    type="text"
                    placeholder="Andar (opcional)"
                    value={newClient.floor}
                    onChange={handleNewClientChange('floor')}
                    className="form-input"
                    />
                </div>
                <div className="form-group">
                    <input
                    type="text"
                    placeholder="Bloco (opcional)"
                    value={newClient.block}
                    onChange={handleNewClientChange('block')}
                    className="form-input"
                    />
                </div>
                </div>
            )}
            </div>
        </div>
        </div>

        {/* Selection Status */}
        <div className="selection-status">
        {selectedClient ? (
            <div className="status-message success">
            ✅ <strong>Cliente selecionado:</strong> {selectedClient.name}
            </div>
        ) : newClient.name ? (
            <div className="status-message info">
            📝 <strong>Criando novo cliente:</strong> {newClient.name}
            </div>
        ) : (
            <div className="status-message warning">
            ⚠️ Selecione um cliente existente OU preencha os dados para criar um novo
            </div>
        )}
        </div>

        {error && (
        <div className="error-message">
            {error}
        </div>
        )}

        <div className="wizard-actions">
        <button type="button" onClick={handleBack} className="btn-secondary">
            ← Voltar
        </button>
        <button
            type="button"
            onClick={handleNext}
            disabled={!canProceedToStep3()}
            className="btn-primary"
        >
            Continuar →
        </button>
        </div>
    </div>
    );

  // Step 3: Survey Details
  const renderStep3 = () => {
    const finalBuilding = selectedBuilding || newBuilding;
    const finalClient = selectedClient || newClient;

    return (
      <div className="wizard-step">
        <h3>📋 Detalhes da Vistoria</h3>
        <p className="step-description">
          Confirme os dados e agende a vistoria.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Summary */}
          <div className="wizard-summary">
            <h4>Resumo da Vistoria</h4>
            <div className="summary-grid">
              <div className="summary-section">
                <h5>🏢 Edifício</h5>
                <p><strong>Nome:</strong> {finalBuilding.name}</p>
                <p><strong>Endereço:</strong> {finalBuilding.address}</p>
                <p><strong>Construtora:</strong> {finalBuilding.constructionCompany}</p>
              </div>
              
              <div className="summary-section">
                <h5>👤 Cliente</h5>
                <p><strong>Nome:</strong> {finalClient.name}</p>
                <p><strong>Email:</strong> {finalClient.email}</p>
                <p><strong>Telefone:</strong> {finalClient.phone}</p>
                <p><strong>Propriedade:</strong> {finalClient.propertyNumber} ({finalClient.propertyType === 'apartment' ? 'Apartamento' : 'Casa'})</p>
                {finalClient.floor && <p><strong>Andar:</strong> {finalClient.floor}</p>}
                {finalClient.block && <p><strong>Bloco:</strong> {finalClient.block}</p>}
              </div>
            </div>
          </div>

          {/* Survey Details */}
          <div className="form-section">
            <h5>Agendamento</h5>
            <div className="form-group">
              <label>Data e Horário da Vistoria *:</label>
              <input
                type="datetime-local"
                value={surveyDetails.surveyDate}
                onChange={handleSurveyDetailsChange('surveyDate')}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Observações do Engenheiro:</label>
              <textarea
                placeholder="Observações iniciais sobre a vistoria..."
                value={surveyDetails.engineerNotes}
                onChange={handleSurveyDetailsChange('engineerNotes')}
                className="form-input"
                rows="4"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="wizard-actions">
            <button type="button" onClick={handleBack} className="btn-secondary">
              ← Voltar
            </button>
            <button
              type="submit"
              disabled={loading || !surveyDetails.surveyDate}
              className="btn-success"
            >
              {loading ? 'Criando...' : '✅ Criar Vistoria'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Progress indicator
  const renderProgress = () => (
    <div className="simple-progress">
      <div className="progress-steps">
        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Edifício</div>
        </div>
        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Cliente</div>
        </div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Vistoria</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="simple-wizard">
      <div className="wizard-header">
        <h2>🧙‍♂️ Nova Vistoria</h2>
        {renderProgress()}
      </div>

      <div className="wizard-content">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default SimpleSurveyWizard;