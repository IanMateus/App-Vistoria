import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyAppService } from '../services/surveyApp';
import RoomManagement from '../components/survey/RoomManagement';
import SurveyInfoEditor from '../components/survey/SurveyInfoEditor';
import SurveyHeaderStats from '../components/survey/SurveyHeaderStats';

const LiveSurveyPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(false);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const [surveysData, roomsData, issuesData] = await Promise.all([
        surveyAppService.getSurveys(),
        surveyAppService.getSurveyRooms(surveyId),
        surveyAppService.getIssuesBySurvey(surveyId)
      ]);

      const currentSurvey = surveysData.find(s => s.id === parseInt(surveyId));
      setSurvey(currentSurvey);
      setRooms(roomsData);
      setIssues(issuesData);
    } catch (error) {
      console.error('Error fetching survey data:', error);
      alert('Erro ao carregar vistoria: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomAdded = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
  };

  const handleRoomUpdated = (updatedRoom) => {
    setRooms(prev => prev.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    ));
  };

  const handleRoomDeleted = (roomId) => {
    setRooms(prev => prev.filter(room => room.id !== roomId));
    // Also remove issues for this room
    setIssues(prev => prev.filter(issue => issue.roomId !== roomId));
  };

  const handleIssueAdded = async (newIssue) => {
    setIssues(prev => [...prev, newIssue]);
    
    // Update the room to show it has issues
    const room = rooms.find(r => r.id === newIssue.roomId);
    if (room && room.status !== 'has_issues') {
      await surveyAppService.updateRoomStatus(room.id, { status: 'has_issues' });
      handleRoomUpdated({ ...room, status: 'has_issues' });
    }
  };

  const handleIssueUpdated = (updatedIssue) => {
    setIssues(prev => prev.map(issue => 
      issue.id === updatedIssue.id ? updatedIssue : issue
    ));
  };

  const handleIssueDeleted = (issueId) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
  };

  const handleSurveyUpdated = (updatedSurvey) => {
    setSurvey(updatedSurvey);
    setEditingSurvey(false);
  };

  const handleCompleteSurvey = async () => {
    if (!window.confirm('Deseja finalizar esta vistoria? Esta ação não pode ser desfeita.')) {
      return;
    }

    setCompleting(true);
    try {
      await surveyAppService.updateSurvey(surveyId, {
        status: 'completed',
        finalReport: `Vistoria finalizada em ${new Date().toLocaleDateString('pt-BR')}. ${rooms.length} cômodos inspecionados, ${issues.length} problemas encontrados.`
      });
      
      alert('✅ Vistoria finalizada com sucesso!');
      navigate('/surveys');
    } catch (error) {
      console.error('Error completing survey:', error);
      alert('Erro ao finalizar vistoria: ' + error.message);
    } finally {
      setCompleting(false);
    }
  };

  // ADD THIS FUNCTION - Handle Get Signature
  const handleGetSignature = () => {
    // Navigate to signature page (you'll need to create this page)
    navigate(`/survey/${surveyId}/signature`);
    // For now, let's just show an alert
    alert('Funcionalidade de assinatura será implementada em breve!');
  };

  useEffect(() => {
    if (surveyId) {
      fetchSurveyData();
    }
  }, [surveyId]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando vistoria...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <h2>Vistoria não encontrada</h2>
          <button onClick={() => navigate('/surveys')} className="btn-primary">
            Voltar para Vistorias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Updated Header Section */}
      <div className="dashboard-header">
        <div className="header-main">
          <button 
            onClick={() => navigate('/surveys')}
            className="btn-secondary"
          >
            ← Voltar para Vistorias
          </button>
          <div className="header-title">
            <h2>🔍 Vistoria em Andamento - #{survey.id}</h2>
            <p className="header-subtitle">
              {survey.surveyBuilding?.name} • {survey.surveyClient?.name}
            </p>
          </div>
        </div>
      </div>

      {/* New Header Stats Component */}
      <SurveyHeaderStats
        survey={survey}
        rooms={rooms}
        issues={issues}
        onEditSurvey={() => setEditingSurvey(true)}
        onCompleteSurvey={handleCompleteSurvey}
        onGetSignature={handleGetSignature}
      />

      {/* Survey Info Card */}
      <div className="survey-info-card">
        <div className="info-header">
          <h3>Informações da Vistoria</h3>
          <button 
            onClick={() => setEditingSurvey(true)}
            className="btn-secondary"
          >
            ✏️ Editar
          </button>
        </div>
        <div className="info-grid">
          <div>
            <h4>🏢 {survey.surveyBuilding?.name}</h4>
            <p><strong>Endereço:</strong> {survey.surveyBuilding?.address}</p>
            <p><strong>Construtora:</strong> {survey.surveyBuilding?.constructionCompany}</p>
          </div>
          <div>
            <h4>👤 {survey.surveyClient?.name}</h4>
            <p><strong>Email:</strong> {survey.surveyClient?.email}</p>
            <p><strong>Telefone:</strong> {survey.surveyClient?.phone}</p>
            <p><strong>Propriedade:</strong> {survey.surveyClient?.propertyNumber} ({survey.surveyClient?.propertyType === 'apartment' ? 'Apartamento' : 'Casa'})</p>
          </div>
          <div>
            <h4>📅 Informações da Vistoria</h4>
            <p><strong>Data:</strong> {new Date(survey.surveyDate).toLocaleDateString('pt-BR')}</p>
            <p><strong>Hora:</strong> {new Date(survey.surveyDate).toLocaleTimeString('pt-BR')}</p>
            <p><strong>Status:</strong> 
              <span className={`status-${survey.status}`}>
                {survey.status === 'in_progress' && '🟡 Em Andamento'}
              </span>
            </p>
          </div>
        </div>
        {survey.engineerNotes && (
          <div className="engineer-notes">
            <strong>Observações:</strong> {survey.engineerNotes}
          </div>
        )}
      </div>

      {/* Combined Room Management and Rooms List */}
      <RoomManagement
        surveyId={surveyId}
        rooms={rooms}
        issues={issues}
        onRoomAdded={handleRoomAdded}
        onRoomUpdated={handleRoomUpdated}
        onRoomDeleted={handleRoomDeleted}
        onIssueAdded={handleIssueAdded}
        onIssueUpdated={handleIssueUpdated}
        onIssueDeleted={handleIssueDeleted}
      />

      {/* Edit Survey Modal */}
      {editingSurvey && (
        <SurveyInfoEditor
          survey={survey}
          onSave={handleSurveyUpdated}
          onCancel={() => setEditingSurvey(false)}
        />
      )}
    </div>
  );
};

export default LiveSurveyPage;