import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../services/surveyApp';

const ClientBuildingsPage = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const buildingsData = await surveyAppService.getClientBuildings();
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      alert('Erro ao carregar edifícios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  return (
    <div className="dashboard">
      <h2>Meus Edifícios</h2>
      
      <div className="buildings-list">
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
              </div>
            ))}
          </div>
        )}
        {buildings.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h3>Nenhum edifício encontrado</h3>
            <p>Você ainda não tem edifícios associados ao seu perfil.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBuildingsPage;