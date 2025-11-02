import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../../services/surveyApp';

const SurveyWizard = ({ onSurveyCreated, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // State for client search and creation
  const [clientEmail, setClientEmail] = useState('');
  const [clientExists, setClientExists] = useState(null);
  const [existingClient, setExistingClient] = useState(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // State for building search and creation
  const [buildingSearch, setBuildingSearch] = useState('');
  const [buildingExists, setBuildingExists] = useState(null);
  const [existingBuilding, setExistingBuilding] = useState(null);
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    address: '',
    constructionCompany: '',
    numberOfFloors: '',
    numberOfUnits: ''
  });

  // State for apartment details and survey
  const [apartmentDetails, setApartmentDetails] = useState({
    apartmentNumber: '',
    floor: '',
    block: ''
  });
  
  const [surveyForm, setSurveyForm] = useState({
    surveyDate: '',
    engineerNotes: ''
  });

  // Check if client exists
  const checkClientExists = async () => {
    if (!clientEmail) return;
    
    setSearching(true);
    try {
      const clients = await surveyAppService.getClients();
      const client = clients.find(c => c.email.toLowerCase() === clientEmail.toLowerCase());
      
      if (client) {
        setClientExists(true);
        setExistingClient(client);
        setClientForm({
          name: client.name,
          email: client.email,
          phone: client.phone,
          address: client.address
        });
      } else {
        setClientExists(false);
        setClientForm(prev => ({ ...prev, email: clientEmail }));
      }
    } catch (error) {
      console.error('Error checking client:', error);
      alert('Erro ao verificar cliente: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  // Check if building exists
  const checkBuildingExists = async () => {
    if (!buildingSearch) return;
    
    setSearching(true);
    try {
      const buildings = await surveyAppService.getBuildings();
      const building = buildings.find(b => 
        b.name.toLowerCase().includes(buildingSearch.toLowerCase()) ||
        b.address.toLowerCase().includes(buildingSearch.toLowerCase())
      );
      
      if (building) {
        setBuildingExists(true);
        setExistingBuilding(building);
        setBuildingForm({
          name: building.name,
          address: building.address,
          constructionCompany: building.constructionCompany,
          numberOfFloors: building.numberOfFloors,
          numberOfUnits: building.numberOfUnits
        });
      } else {
        setBuildingExists(false);
        setBuildingForm(prev => ({ ...prev, name: buildingSearch }));
      }
    } catch (error) {
      console.error('Error checking building:', error);
      alert('Erro ao verificar edifício: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  // Create client
  const createClient = async () => {
    try {
      const newClient = await surveyAppService.createClient(clientForm);
      setExistingClient(newClient);
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  // Create building
  const createBuilding = async () => {
    try {
      const newBuilding = await surveyAppService.createBuilding(buildingForm);
      setExistingBuilding(newBuilding);
      return newBuilding;
    } catch (error) {
      console.error('Error creating building:', error);
      throw error;
    }
  };

  // Link client to building
  const linkClientToBuilding = async (clientId, buildingId) => {
    try {
      const link = await surveyAppService.linkClientToBuilding({
        clientEmail: clientForm.email,
        buildingId: buildingId,
        apartmentNumber: apartmentDetails.apartmentNumber,
        floor: apartmentDetails.floor,
        block: apartmentDetails.block
      });
      return link;
    } catch (error) {
      console.error('Error linking client to building:', error);
      throw error;
    }
  };

  // Create survey
  const createSurvey = async (clientId, buildingId) => {
    try {
      const survey = await surveyAppService.createSurvey({
        clientId: clientId,
        buildingId: buildingId,
        surveyDate: surveyForm.surveyDate,
        engineerNotes: surveyForm.engineerNotes
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

    try {
      let finalClient = existingClient;
      let finalBuilding = existingBuilding;

      // Step 1: Create client if needed
      if (!finalClient) {
        finalClient = await createClient();
      }

      // Step 2: Create building if needed
      if (!finalBuilding) {
        finalBuilding = await createBuilding();
      }

      // Step 3: Link client to building
      await linkClientToBuilding(finalClient.id, finalBuilding.id);

      // Step 4: Create survey
      const survey = await createSurvey(finalClient.id, finalBuilding.id);

      alert('✅ Vistoria criada com sucesso!');
      onSurveyCreated(survey);
      
    } catch (error) {
      console.error('Error in survey creation:', error);
      alert('Erro ao criar vistoria: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset the wizard
  const resetWizard = () => {
    setStep(1);
    setClientEmail('');
    setClientExists(null);
    setExistingClient(null);
    setClientForm({ name: '', email: '', phone: '', address: '' });
    setBuildingSearch('');
    setBuildingExists(null);
    setExistingBuilding(null);
    setBuildingForm({ name: '', address: '', constructionCompany: '', numberOfFloors: '', numberOfUnits: '' });
    setApartmentDetails({ apartmentNumber: '', floor: '', block: '' });
    setSurveyForm({ surveyDate: '', engineerNotes: '' });
  };

  // Handle input changes
  const handleClientFormChange = (field) => (e) => {
    setClientForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleBuildingFormChange = (field) => (e) => {
    setBuildingForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleApartmentChange = (field) => (e) => {
    setApartmentDetails(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSurveyFormChange = (field) => (e) => {
    setSurveyForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Determine next step based on current state
  const getNextStep = () => {
    if (step === 1) {
      if (clientExists === true && buildingExists === true) {
        return 4; // Both exist, go to apartment details
      } else if (clientExists === false && buildingExists === true) {
        return 2; // Client doesn't exist, building exists
      } else if (clientExists === true && buildingExists === false) {
        return 3; // Client exists, building doesn't exist
      } else {
        return 2; // Neither exists, start with client
      }
    }
    return step + 1;
  };

  const handleNext = () => {
    const nextStep = getNextStep();
    setStep(nextStep);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // Render step 1: Client and Building Search
  const renderStep1 = () => (
    <div className="wizard-step">
      <h3>🔍 Buscar Cliente e Edifício</h3>
      <p className="step-description">
        Vamos verificar se o cliente e o edifício já estão cadastrados no sistema.
      </p>

      <div className="search-sections">
        {/* Client Search */}
        <div className="search-section">
          <h4>👤 Buscar Cliente</h4>
          <div className="form-group">
            <label>Email do Cliente:</label>
            <div className="search-input-group">
              <input
                type="email"
                placeholder="cliente@exemplo.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                onClick={checkClientExists}
                disabled={searching || !clientEmail}
                className="btn-primary"
              >
                {searching ? '🔍...' : 'Buscar'}
              </button>
            </div>
          </div>

          {clientExists === true && (
            <div className="search-result success">
              <div className="result-icon">✅</div>
              <div>
                <strong>Cliente encontrado:</strong> {existingClient.name}
                <br />
                <small>Email: {existingClient.email} | Tel: {existingClient.phone}</small>
              </div>
            </div>
          )}

          {clientExists === false && (
            <div className="search-result info">
              <div className="result-icon">🆕</div>
              <div>
                <strong>Cliente não encontrado</strong>
                <br />
                <small>Você poderá cadastrar este cliente no próximo passo</small>
              </div>
            </div>
          )}
        </div>

        {/* Building Search */}
        <div className="search-section">
          <h4>🏢 Buscar Edifício</h4>
          <div className="form-group">
            <label>Nome ou Endereço do Edifício:</label>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Nome do edifício ou endereço"
                value={buildingSearch}
                onChange={(e) => setBuildingSearch(e.target.value)}
                className="form-input"
              />
              <button
                type="button"
                onClick={checkBuildingExists}
                disabled={searching || !buildingSearch}
                className="btn-primary"
              >
                {searching ? '🔍...' : 'Buscar'}
              </button>
            </div>
          </div>

          {buildingExists === true && (
            <div className="search-result success">
              <div className="result-icon">✅</div>
              <div>
                <strong>Edifício encontrado:</strong> {existingBuilding.name}
                <br />
                <small>Endereço: {existingBuilding.address}</small>
              </div>
            </div>
          )}

          {buildingExists === false && (
            <div className="search-result info">
              <div className="result-icon">🏗️</div>
              <div>
                <strong>Edifício não encontrado</strong>
                <br />
                <small>Você poderá cadastrar este edifício no próximo passo</small>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="wizard-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={clientExists === null || buildingExists === null}
          className="btn-primary"
        >
          Continuar →
        </button>
      </div>
    </div>
  );

  // Render step 2: Create Client (if needed)
  const renderStep2 = () => (
    <div className="wizard-step">
      <h3>👤 Cadastrar Novo Cliente</h3>
      <p className="step-description">
        Preencha os dados do cliente para cadastrá-lo no sistema.
      </p>

      <form>
        <div className="form-group">
          <label>Nome Completo:</label>
          <input
            type="text"
            placeholder="Nome do cliente"
            value={clientForm.name}
            onChange={handleClientFormChange('name')}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="cliente@exemplo.com"
            value={clientForm.email}
            onChange={handleClientFormChange('email')}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Telefone:</label>
          <input
            type="text"
            placeholder="(11) 99999-9999"
            value={clientForm.phone}
            onChange={handleClientFormChange('phone')}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Endereço Residencial:</label>
          <input
            type="text"
            placeholder="Endereço completo"
            value={clientForm.address}
            onChange={handleClientFormChange('address')}
            required
            className="form-input"
          />
        </div>
      </form>

      <div className="wizard-actions">
        <button type="button" onClick={handleBack} className="btn-secondary">
          ← Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!clientForm.name || !clientForm.email || !clientForm.phone || !clientForm.address}
          className="btn-primary"
        >
          Continuar →
        </button>
      </div>
    </div>
  );

  // Render step 3: Create Building (if needed)
  const renderStep3 = () => (
    <div className="wizard-step">
      <h3>🏢 Cadastrar Novo Edifício</h3>
      <p className="step-description">
        Preencha os dados do edifício onde será realizada a vistoria.
      </p>

      <form>
        <div className="form-group">
          <label>Nome do Edifício:</label>
          <input
            type="text"
            placeholder="Nome do edifício"
            value={buildingForm.name}
            onChange={handleBuildingFormChange('name')}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Endereço Completo:</label>
          <input
            type="text"
            placeholder="Endereço completo"
            value={buildingForm.address}
            onChange={handleBuildingFormChange('address')}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Construtora:</label>
          <input
            type="text"
            placeholder="Nome da construtora"
            value={buildingForm.constructionCompany}
            onChange={handleBuildingFormChange('constructionCompany')}
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Número de Andares:</label>
            <input
              type="number"
              placeholder="Ex: 10"
              value={buildingForm.numberOfFloors}
              onChange={handleBuildingFormChange('numberOfFloors')}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Número de Unidades:</label>
            <input
              type="number"
              placeholder="Ex: 40"
              value={buildingForm.numberOfUnits}
              onChange={handleBuildingFormChange('numberOfUnits')}
              required
              className="form-input"
            />
          </div>
        </div>
      </form>

      <div className="wizard-actions">
        <button type="button" onClick={handleBack} className="btn-secondary">
          ← Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!buildingForm.name || !buildingForm.address || !buildingForm.constructionCompany || !buildingForm.numberOfFloors || !buildingForm.numberOfUnits}
          className="btn-primary"
        >
          Continuar →
        </button>
      </div>
    </div>
  );

  // Render step 4: Apartment Details
  const renderStep4 = () => (
    <div className="wizard-step">
      <h3>🏠 Dados do Apartamento/Casa</h3>
      <p className="step-description">
        Informe os detalhes específicos da unidade do cliente no edifício.
      </p>

      <form>
        <div className="form-group">
          <label>Número do Apartamento/Casa:</label>
          <input
            type="text"
            placeholder="Ex: 101, A1, Casa 2"
            value={apartmentDetails.apartmentNumber}
            onChange={handleApartmentChange('apartmentNumber')}
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Andar (opcional):</label>
            <input
              type="text"
              placeholder="Ex: 1º, Térreo"
              value={apartmentDetails.floor}
              onChange={handleApartmentChange('floor')}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Bloco (opcional):</label>
            <input
              type="text"
              placeholder="Ex: A, B, Central"
              value={apartmentDetails.block}
              onChange={handleApartmentChange('block')}
              className="form-input"
            />
          </div>
        </div>
      </form>

      <div className="wizard-actions">
        <button type="button" onClick={handleBack} className="btn-secondary">
          ← Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!apartmentDetails.apartmentNumber}
          className="btn-primary"
        >
          Continuar →
        </button>
      </div>
    </div>
  );

  // Render step 5: Survey Details
  const renderStep5 = () => (
    <div className="wizard-step">
      <h3>📋 Detalhes da Vistoria</h3>
      <p className="step-description">
        Configure os detalhes finais da vistoria agendada.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Data e Horário da Vistoria:</label>
          <input
            type="datetime-local"
            value={surveyForm.surveyDate}
            onChange={handleSurveyFormChange('surveyDate')}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Observações do Engenheiro:</label>
          <textarea
            placeholder="Observações iniciais sobre a vistoria..."
            value={surveyForm.engineerNotes}
            onChange={handleSurveyFormChange('engineerNotes')}
            className="form-input"
            rows="4"
          />
        </div>

        {/* Summary */}
        <div className="wizard-summary">
          <h4>Resumo da Vistoria</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <strong>Cliente:</strong> {clientForm.name}
            </div>
            <div className="summary-item">
              <strong>Email:</strong> {clientForm.email}
            </div>
            <div className="summary-item">
              <strong>Edifício:</strong> {buildingForm.name}
            </div>
            <div className="summary-item">
              <strong>Endereço:</strong> {buildingForm.address}
            </div>
            <div className="summary-item">
              <strong>Apartamento:</strong> {apartmentDetails.apartmentNumber}
              {apartmentDetails.floor && ` - ${apartmentDetails.floor} andar`}
              {apartmentDetails.block && ` - Bloco ${apartmentDetails.block}`}
            </div>
          </div>
        </div>

        <div className="wizard-actions">
          <button type="button" onClick={handleBack} className="btn-secondary">
            ← Voltar
          </button>
          <button
            type="submit"
            disabled={loading || !surveyForm.surveyDate}
            className="btn-success"
          >
            {loading ? 'Criando...' : '✅ Criar Vistoria'}
          </button>
        </div>
      </form>
    </div>
  );

  // Progress indicator
  const renderProgress = () => {
    const steps = [
      { number: 1, title: 'Buscar' },
      { number: 2, title: clientExists === false ? 'Cliente' : 'Pular' },
      { number: 3, title: buildingExists === false ? 'Edifício' : 'Pular' },
      { number: 4, title: 'Apartamento' },
      { number: 5, title: 'Vistoria' }
    ];

    return (
      <div className="wizard-progress">
        {steps.map((stepItem, index) => (
          <div key={stepItem.number} className="progress-item">
            <div className={`progress-circle ${stepItem.number === step ? 'active' : stepItem.number < step ? 'completed' : ''}`}>
              {stepItem.number < step ? '✓' : stepItem.number}
            </div>
            <div className="progress-label">{stepItem.title}</div>
            {index < steps.length - 1 && <div className="progress-line"></div>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="survey-wizard">
      <div className="wizard-header">
        <h2>🧙‍♂️ Assistente de Nova Vistoria</h2>
        {renderProgress()}
      </div>

      <div className="wizard-content">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </div>
    </div>
  );
};

export default SurveyWizard;