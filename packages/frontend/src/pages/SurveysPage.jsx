import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { surveyAppService } from '../services/surveyApp';
import SimpleSurveyWizard from '../components/survey/SimpleSurveyWizard'

const SurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const surveysData = await surveyAppService.getSurveys();
      setSurveys(surveysData);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      alert('Erro ao carregar vistorias: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyCreated = (newSurvey) => {
    setShowWizard(false);
    fetchSurveys();
  };

  const handleStartLiveSurvey = async (surveyId) => {
    try {
      await surveyAppService.startLiveSurvey(surveyId);
      window.location.href = `/live-survey/${surveyId}`;
    } catch (error) {
      console.error('Error starting live survey:', error);
      alert('Erro ao iniciar vistoria: ' + error.message);
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta vistoria? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await surveyAppService.deleteSurvey(surveyId);
      alert('Vistoria excluída com sucesso!');
      fetchSurveys();
    } catch (error) {
      console.error('Error deleting survey:', error);
      alert('Erro ao excluir vistoria: ' + error.message);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const scheduledSurveys = surveys.filter(s => s.status === 'scheduled');
  const inProgressSurveys = surveys.filter(s => s.status === 'in_progress');
  const completedSurveys = surveys.filter(s => s.status === 'completed' || s.status === 'signed');

  if (showWizard) {
    return (
      <div className="dashboard">
        <SimpleSurveyWizard 
          onSurveyCreated={handleSurveyCreated}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📋 Vistorias</h2>
        <button 
          onClick={() => setShowWizard(true)}
          className="btn-primary"
        >
          🧙‍♂️ Nova Vistoria
        </button>
      </div>

      {/* Survey Stats Summary */}
      <div className="survey-stats-summary">
        <div className="stat-card">
          <div className="stat-number">{surveys.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{scheduledSurveys.length}</div>
          <div className="stat-label">Agendadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inProgressSurveys.length}</div>
          <div className="stat-label">Em Andamento</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completedSurveys.length}</div>
          <div className="stat-label">Concluídas</div>
        </div>
      </div>

      {/* In Progress Surveys */}
      {inProgressSurveys.length > 0 && (
        <div className="survey-section">
          <h3>🔍 Vistorias em Andamento</h3>
          <div className="surveys-grid urgent">
            {inProgressSurveys.map(survey => (
              <div key={survey.id} className="survey-card urgent">
                <div className="survey-header">
                  <h4>Vistoria #{survey.id}</h4>
                  <span className="status-badge status-in_progress">
                    🔄 Em Andamento
                  </span>
                </div>
                {/* FIXED: Using correct property names */}
                <p><strong>Edifício:</strong> {survey.surveyBuilding?.name || 'N/A'}</p>
                <p><strong>Cliente:</strong> {survey.surveyClient?.name || 'N/A'}</p>
                <p><strong>Data:</strong> {new Date(survey.surveyDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Cômodos:</strong> {survey.surveyRooms?.length || 0}</p>
                <p><strong>Problemas:</strong> {survey.surveyIssues?.length || 0}</p>
                
                <div className="survey-actions">
                  <Link 
                    to={`/live-survey/${survey.id}`}
                    className="btn-primary"
                  >
                    ▶️ Continuar Vistoria
                  </Link>
                  <button 
                    onClick={() => handleDeleteSurvey(survey.id)}
                    className="btn-danger"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Surveys */}
      <div className="survey-section">
        <h3>📅 Vistorias Agendadas</h3>
        {scheduledSurveys.length > 0 ? (
          <div className="surveys-grid">
            {scheduledSurveys.map(survey => (
              <div key={survey.id} className="survey-card">
                <h4>Vistoria #{survey.id}</h4>
                {/* FIXED: Using correct property names */}
                <p><strong>Edifício:</strong> {survey.surveyBuilding?.name || 'N/A'}</p>
                <p><strong>Cliente:</strong> {survey.surveyClient?.name || 'N/A'}</p>
                <p><strong>Apartamento:</strong> {survey.surveyClient?.propertyNumber}</p>
                <p><strong>Data:</strong> {new Date(survey.surveyDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Hora:</strong> {new Date(survey.surveyDate).toLocaleTimeString('pt-BR')}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-${survey.status}`}>
                    {survey.status === 'scheduled' && '🟡 Agendada'}
                  </span>
                </p>
                
                <div className="survey-actions">
                  <button 
                    onClick={() => handleStartLiveSurvey(survey.id)}
                    className="btn-success"
                  >
                    🔍 Iniciar Vistoria
                  </button>
                  <button 
                    onClick={() => handleDeleteSurvey(survey.id)}
                    className="btn-danger"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Nenhuma vistoria agendada</h3>
            <p>Use o assistente para criar sua primeira vistoria.</p>
            <button 
              onClick={() => setShowWizard(true)}
              className="btn-primary"
            >
              🧙‍♂️ Criar Primeira Vistoria
            </button>
          </div>
        )}
      </div>

      {/* Completed Surveys */}
      {completedSurveys.length > 0 && (
        <div className="survey-section">
          <h3>✅ Vistorias Finalizadas</h3>
          <div className="surveys-grid">
            {completedSurveys.map(survey => (
              <div key={survey.id} className="survey-card completed">
                <h4>Vistoria #{survey.id}</h4>
                {/* FIXED: Using correct property names */}
                <p><strong>Edifício:</strong> {survey.surveyBuilding?.name || 'N/A'}</p>
                <p><strong>Cliente:</strong> {survey.surveyClient?.name || 'N/A'}</p>
                <p><strong>Data:</strong> {new Date(survey.surveyDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-${survey.status}`}>
                    {survey.status === 'completed' && '🟢 Concluída'}
                    {survey.status === 'signed' && '✅ Assinada'}
                  </span>
                </p>
                <p><strong>Cômodos:</strong> {survey.surveyRooms?.length || 0}</p>
                <p><strong>Problemas:</strong> {survey.surveyIssues?.length || 0}</p>
                
                <div className="survey-actions">
                  <button className="btn-secondary">
                    📄 Ver Relatório
                  </button>
                  <button 
                    onClick={() => handleDeleteSurvey(survey.id)}
                    className="btn-danger"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveysPage;