import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../services/surveyApp';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    apartmentNumber: ''
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsData = await surveyAppService.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Erro ao carregar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await surveyAppService.createClient(formData);
      setFormData({ name: '', email: '', phone: '', address: '', apartmentNumber: '' });
      fetchClients();
      alert('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Erro ao criar cliente: ' + error.message);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="dashboard">
      <h2>Gerenciar Clientes</h2>
      
      <div className="building-form">
        <h3>Cadastrar Novo Cliente</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome do Cliente"
            value={formData.name}
            onChange={handleInputChange('name')}
            required
            className="form-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange('email')}
            required
            className="form-input"
          />
          <input
            type="text"
            placeholder="Telefone"
            value={formData.phone}
            onChange={handleInputChange('phone')}
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
            placeholder="Número do Apartamento"
            value={formData.apartmentNumber}
            onChange={handleInputChange('apartmentNumber')}
            required
            className="form-input"
          />
          <button type="submit" className="submit-button">Cadastrar Cliente</button>
        </form>
      </div>

      <div className="buildings-list">
        <h3>Clientes Cadastrados</h3>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="buildings-grid">
            {clients.map(client => (
              <div key={client.id} className="building-card">
                <h4>{client.name}</h4>
                <p><strong>Email:</strong> {client.email}</p>
                <p><strong>Telefone:</strong> {client.phone}</p>
                <p><strong>Endereço:</strong> {client.address}</p>
                <p><strong>Apartamento:</strong> {client.apartmentNumber}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;