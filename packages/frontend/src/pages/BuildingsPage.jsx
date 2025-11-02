import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../services/surveyApp';
import ClientBuildingLink from '../components/linking/ClientBuildingLink';

const BuildingsPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [buildingClients, setBuildingClients] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('buildings');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    constructionCompany: '',
    numberOfFloors: '',
    numberOfUnits: ''
  });

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const buildingsData = await surveyAppService.getBuildings();
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      alert('Erro ao carregar edifícios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildingClients = async (buildingId) => {
    try {
      const clients = await surveyAppService.getBuildingClients(buildingId);
      setBuildingClients(prev => ({
        ...prev,
        [buildingId]: clients
      }));
    } catch (error) {
      console.error('Error fetching building clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await surveyAppService.createBuilding(formData);
      setFormData({ name: '', address: '', constructionCompany: '', numberOfFloors: '', numberOfUnits: '' });
      fetchBuildings();
      alert('🏢 Edifício cadastrado com sucesso!');
    } catch (error) {
      console.error('Error creating building:', error);
      alert('Erro ao criar edifício: ' + error.message);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleViewClients = (building) => {
    setSelectedBuilding(building);
    setActiveTab('clients');
    if (!buildingClients[building.id]) {
      fetchBuildingClients(building.id);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🏢 Gerenciar Edifícios</h2>
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'buildings' ? 'active' : ''}`}
            onClick={() => setActiveTab('buildings')}
          >
            Edifícios
          </button>
          <button 
            className={`tab-button ${activeTab === 'linking' ? 'active' : ''}`}
            onClick={() => setActiveTab('linking')}
          >
            Vincular Clientes
          </button>
          {selectedBuilding && activeTab === 'clients' && (
            <button className="tab-button active">
              Clientes - {selectedBuilding.name}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'buildings' && (
        <>
          <div className="building-form">
            <h3>Cadastrar Novo Edifício</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nome do Edifício"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
                className="form-input"
              />
              <input
                type="text"
                placeholder="Endereço"
                value={formData.address}
                onChange={handleInputChange('address')}
                required
                className="form-input"
              />
              <input
                type="text"
                placeholder="Construtora"
                value={formData.constructionCompany}
                onChange={handleInputChange('constructionCompany')}
                required
                className="form-input"
              />
              <input
                type="number"
                placeholder="Número de Andares"
                value={formData.numberOfFloors}
                onChange={handleInputChange('numberOfFloors')}
                required
                className="form-input"
              />
              <input
                type="number"
                placeholder="Número de Unidades"
                value={formData.numberOfUnits}
                onChange={handleInputChange('numberOfUnits')}
                required
                className="form-input"
              />
              <button type="submit" className="submit-button">Cadastrar Edifício</button>
            </form>
          </div>

          <div className="buildings-list">
            <h3>Edifícios Cadastrados</h3>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div className="buildings-grid">
                {buildings.map(building => (
                  <div key={building.id} className="building-card">
                    <h4>{building.name}</h4>
                    <p><strong>Endereço:</strong> {building.address}</p>
                    <p><strong>Construtora:</strong> {building.constructionCompany}</p>
                    <p><strong>Andares:</strong> {building.numberOfFloors}</p>
                    <p><strong>Unidades:</strong> {building.numberOfUnits}</p>
                    <div className="building-actions">
                      <button 
                        onClick={() => handleViewClients(building)}
                        className="btn-primary"
                      >
                        👥 Ver Clientes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'linking' && (
        <ClientBuildingLink />
      )}

      {activeTab === 'clients' && selectedBuilding && (
        <div className="clients-view">
          <div className="view-header">
            <button 
              onClick={() => setActiveTab('buildings')}
              className="btn-secondary"
            >
              ← Voltar para Edifícios
            </button>
            <h3>👥 Clientes em {selectedBuilding.name}</h3>
          </div>

          <div className="building-info-card">
            <h4>Informações do Edifício</h4>
            <p><strong>Endereço:</strong> {selectedBuilding.address}</p>
            <p><strong>Construtora:</strong> {selectedBuilding.constructionCompany}</p>
          </div>

          {buildingClients[selectedBuilding.id] ? (
            <div className="clients-grid">
              {buildingClients[selectedBuilding.id].map(link => (
                <div key={link.id} className="building-card">
                  <h5>{link.Client.name}</h5>
                  <p><strong>Email:</strong> {link.Client.email}</p>
                  <p><strong>Telefone:</strong> {link.Client.phone}</p>
                  <p><strong>Apartamento:</strong> {link.apartmentNumber}</p>
                  {link.floor && <p><strong>Andar:</strong> {link.floor}</p>}
                  {link.block && <p><strong>Bloco:</strong> {link.block}</p>}
                  <div className="status-badge">
                    {link.Client.userId ? '✅ Conta Ativa' : '⏳ Aguardando Registro'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Carregando clientes...</p>
          )}

          {buildingClients[selectedBuilding.id]?.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Nenhum cliente vinculado</h3>
              <p>Use a aba "Vincular Clientes" para adicionar clientes a este edifício.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildingsPage;