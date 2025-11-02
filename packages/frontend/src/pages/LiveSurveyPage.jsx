import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveyAppService } from '../services/surveyApp';
import LiveSurveyRoom from '../components/survey/LiveSurveyRoom';
import RoomStatus from '../components/survey/RoomStatus';

const LiveSurveyPage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

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

  const handleIssueAdded = async (issueData) => {
    try {
      const newIssue = await surveyAppService.createIssue(issueData);
      setIssues(prev => [...prev, newIssue]);
      
      // Update the room to show it has issues
      const room = rooms.find(r => r.id === issueData.roomId);
      if (room && room.status !== 'has_issues') {
        await surveyAppService.updateRoomStatus(room.id, { status: 'has_issues' });
        handleRoomUpdated({ ...room, status: 'has_issues' });
      }
    } catch (error) {
      console.error('Error adding issue:', error);
      throw error;
    }
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

  const pendingRooms = rooms.filter(room => room.status === 'pending').length;
  const completedRooms = rooms.filter(room => room.status !== 'pending').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <button 
            onClick={() => navigate('/surveys')}
            className="btn-secondary"
          >
            ← Voltar para Vistorias
          </button>
          <h2>🔍 Vistoria em Andamento</h2>
        </div>
        
        <div className="survey-stats">
          <span className="stat-badge">
            🚪 {completedRooms}/{rooms.length} Cômodos
          </span>
          <span className="stat-badge">
            ⚠️ {issues.length} Problemas
          </span>
          <button 
            onClick={handleCompleteSurvey}
            disabled={completing || pendingRooms > 0}
            className="btn-success"
            title={pendingRooms > 0 ? 'Complete todos os cômodos primeiro' : ''}
          >
            {completing ? 'Finalizando...' : '✅ Finalizar Vistoria'}
          </button>
        </div>
      </div>

      {/* Survey Info */}
      <div className="survey-info-card">
        <div className="info-grid">
          <div>
            <h4>🏢 {survey.building?.name}</h4>
            <p><strong>Endereço:</strong> {survey.building?.address}</p>
          </div>
          <div>
            <h4>👤 {survey.client?.name}</h4>
            <p><strong>Apartamento:</strong> {survey.client?.apartmentNumber}</p>
            <p><strong>Telefone:</strong> {survey.client?.phone}</p>
          </div>
          <div>
            <h4>🏗️ {survey.engineer?.name}</h4>
            <p><strong>Empresa:</strong> {survey.engineer?.company}</p>
            <p><strong>CREA:</strong> {survey.engineer?.licenseNumber}</p>
          </div>
        </div>
      </div>

      {/* Room Management */}
      <LiveSurveyRoom 
        surveyId={surveyId}
        onRoomAdded={handleRoomAdded}
        onRoomUpdated={handleRoomUpdated}
      />

      {/* Rooms List */}
      <div className="rooms-section">
        <h4>🚪 Cômodos da Vistoria</h4>
        
        {rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚪</div>
            <h3>Nenhum cômodo adicionado</h3>
            <p>Comece adicionando os cômodos que serão inspecionados.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map(room => (
              <RoomStatus
                key={room.id}
                room={{
                  ...room,
                  issues: issues.filter(issue => issue.roomId === room.id),
                  surveyId: survey.id
                }}
                onStatusChange={handleRoomUpdated}
                onAddIssue={handleIssueAdded}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {rooms.length > 0 && (
        <div className="progress-summary">
          <h4>📊 Resumo do Progresso</h4>
          <div className="progress-bars">
            <div className="progress-item">
              <label>Pendentes: {pendingRooms}</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill pending" 
                  style={{ width: `${(pendingRooms / rooms.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="progress-item">
              <label>Com Problemas: {rooms.filter(r => r.status === 'has_issues').length}</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill has-issues" 
                  style={{ width: `${(rooms.filter(r => r.status === 'has_issues').length / rooms.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="progress-item">
              <label>OK: {rooms.filter(r => r.status === 'inspected_ok').length}</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill inspected-ok" 
                  style={{ width: `${(rooms.filter(r => r.status === 'inspected_ok').length / rooms.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSurveyPage;