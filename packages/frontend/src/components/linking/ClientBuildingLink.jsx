import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../../services/surveyApp';

const ClientBuildingLink = () => {
  const [buildings, setBuildings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientEmail: '',
    buildingId: '',
    apartmentNumber: '',
    floor: '',
    block: ''
  });
  const [message, setMessage] = useState('');

  const fetchBuildings = async () => {
    try {
      const buildingsData = await surveyAppService.getBuildings();
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      setMessage('Erro ao carregar edifícios: ' + error.message);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await surveyAppService.linkClientToBuilding(formData);
      setMessage('✅ Cliente vinculado ao edifício com sucesso!');
      setFormData({
        clientEmail: '',
        buildingId: '',
        apartmentNumber: '',
        floor: '',
        block: ''
      });
    } catch (error) {
      console.error('Error linking client:', error);
      setMessage('❌ Erro ao vincular cliente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    fetchBuildings();
    fetchClients();
  }, []);

  return (
    <div className="building-form">
      <h3>📋 Vincular Cliente a Edifício</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email do Cliente:</label>
          <input
            type="email"
            placeholder="cliente@exemplo.com"
            value={formData.clientEmail}
            onChange={handleInputChange('clientEmail')}
            required
            className="form-input"
          />
          <small>Use o email que o cliente usará para se registrar</small>
        </div>

        <div className="form-group">
          <label>Edifício:</label>
          <select 
            value={formData.buildingId} 
            onChange={handleInputChange('buildingId')}
            required
            className="form-input"
          >
            <option value="">Selecione o Edifício</option>
            {buildings.map(building => (
              <option key={building.id} value={building.id}>
                {building.name} - {building.address}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Número do Apartamento/Casa:</label>
          <input
            type="text"
            placeholder="Ex: 101, A1, Casa 2"
            value={formData.apartmentNumber}
            onChange={handleInputChange('apartmentNumber')}
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
              value={formData.floor}
              onChange={handleInputChange('floor')}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Bloco (opcional):</label>
            <input
              type="text"
              placeholder="Ex: A, B, Central"
              value={formData.block}
              onChange={handleInputChange('block')}
              className="form-input"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Vinculando...' : '🔗 Vincular Cliente'}
        </button>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>

      {/* Existing Clients List */}
      <div className="clients-list" style={{ marginTop: '2rem' }}>
        <h4>👥 Clientes Cadastrados</h4>
        <div className="buildings-grid">
          {clients.map(client => (
            <div key={client.id} className="building-card">
              <h5>{client.name}</h5>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Telefone:</strong> {client.phone}</p>
              <p><strong>Endereço:</strong> {client.address}</p>
              <p><strong>Apartamento:</strong> {client.apartmentNumber}</p>
              {client.userId ? (
                <span className="status-badge linked">✅ Conta Vinculada</span>
              ) : (
                <span className="status-badge pending">⏳ Aguardando Registro</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientBuildingLink;