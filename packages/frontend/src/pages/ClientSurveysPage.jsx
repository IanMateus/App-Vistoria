import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../services/surveyApp';

const ClientSurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const surveysData = await surveyAppService.getClientSurveys();
      setSurveys(surveysData);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      alert('Erro ao carregar vistorias: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (surveyId) => {
    try {
      const report = await surveyAppService.generateSurveyReport(surveyId);
      alert('Relatório gerado com sucesso! Em uma implementação real, isso baixaria um PDF.');
      console.log('Report data:', report);
      // In a real app, you would trigger PDF download here
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório: ' + error.message);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return (
    <div className="dashboard">
      <h2>Minhas Vistorias</h2>
      
      <div className="surveys-list">
        {loading ? (
          <p>Carregando...</p>
        ) : (
          surveys.map(survey => (
            <div key={survey.id} className="survey-card">
              <div className="survey-header">
                <h4>Vistoria #{survey.id}</h4>
                <button 
                  onClick={() => handleDownloadReport(survey.id)}
                  className="btn-primary"
                >
                  📄 Baixar Relatório
                </button>
              </div>
              <p><strong>Edifício:</strong> {survey.building?.name}</p>
              <p><strong>Engenheiro:</strong> {survey.engineer?.name}</p>
              <p><strong>Empresa:</strong> {survey.engineer?.company}</p>
              <p><strong>CREA:</strong> {survey.engineer?.licenseNumber}</p>
              <p><strong>Data:</strong> {new Date(survey.surveyDate).toLocaleDateString('pt-BR')}</p>
              <p><strong>Status:</strong> 
                <span className={`status-${survey.status}`}>
                  {survey.status === 'scheduled' && '🟡 Agendada'}
                  {survey.status === 'in_progress' && '🔵 Em Andamento'}
                  {survey.status === 'completed' && '🟢 Concluída'}
                  {survey.status === 'signed' && '✅ Assinada'}
                </span>
              </p>
              <p><strong>Problemas Identificados:</strong> {survey.issues?.length || 0}</p>
              
              {survey.issues && survey.issues.length > 0 && (
                <div className="issues-list">
                  <h5>Problemas Encontrados:</h5>
                  {survey.issues.map(issue => (
                    <div key={issue.id} className="issue-item">
                      <p><strong>Área:</strong> {issue.area}</p>
                      <p><strong>Descrição:</strong> {issue.description}</p>
                      <p><strong>Gravidade:</strong> 
                        <span className={`severity-${issue.severity}`}>
                          {issue.severity === 'low' && '🟢 Baixa'}
                          {issue.severity === 'medium' && '🟡 Média'}
                          {issue.severity === 'high' && '🟠 Alta'}
                          {issue.severity === 'critical' && '🔴 Crítica'}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {surveys.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Nenhuma vistoria encontrada</h3>
            <p>Você ainda não tem vistorias associadas ao seu perfil.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSurveysPage;