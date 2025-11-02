import React from 'react';

const SurveyHeaderStats = ({ 
  survey, 
  rooms, 
  issues, 
  onEditSurvey, 
  onCompleteSurvey, 
  onGetSignature 
}) => {
  const pendingRooms = rooms.filter(room => room.status === 'pending').length;
  const completedRooms = rooms.filter(room => room.status !== 'pending').length;
  const roomsWithIssues = rooms.filter(room => room.status === 'has_issues').length;
  const okRooms = rooms.filter(room => room.status === 'inspected_ok').length;
  const totalRooms = rooms.length;

  const pendingIssues = issues.filter(issue => issue.status === 'pending').length;
  const fixedIssues = issues.filter(issue => issue.status === 'fixed').length;
  const totalIssues = issues.length;

  const progressPercentage = totalRooms > 0 ? Math.round((completedRooms / totalRooms) * 100) : 0;

  return (
    <div className="survey-header-stats">
      {/* Badges Row */}
      <div className="stats-badges-row">
        <div className="stat-badge">
          <div className="badge-icon">🚪</div>
          <div className="badge-content">
            <div className="badge-value">{completedRooms}/{totalRooms}</div>
            <div className="badge-label">Cômodos</div>
          </div>
        </div>
        
        <div className="stat-badge">
          <div className="badge-icon">⚠️</div>
          <div className="badge-content">
            <div className="badge-value">{totalIssues}</div>
            <div className="badge-label">Problemas</div>
          </div>
        </div>
        
        <div className="stat-badge">
          <div className="badge-icon">✅</div>
          <div className="badge-content">
            <div className="badge-value">{fixedIssues}</div>
            <div className="badge-label">Corrigidos</div>
          </div>
        </div>
        
        <div className="stat-badge">
          <div className="badge-icon">📊</div>
          <div className="badge-content">
            <div className="badge-value">{progressPercentage}%</div>
            <div className="badge-label">Progresso</div>
          </div>
        </div>
      </div>

      {/* Progress Bars Row */}
      <div className="progress-bars-detailed">
        <div className="progress-item">
          <div className="progress-label">
            <span>⏳ Pendentes</span>
            <span>{pendingRooms}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill pending" 
              style={{ width: `${(pendingRooms / totalRooms) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="progress-item">
          <div className="progress-label">
            <span>⚠️ Com Problemas</span>
            <span>{roomsWithIssues}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill has-issues" 
              style={{ width: `${(roomsWithIssues / totalRooms) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="progress-item">
          <div className="progress-label">
            <span>✅ OK</span>
            <span>{okRooms}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill inspected-ok" 
              style={{ width: `${(okRooms / totalRooms) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="action-buttons-row">
        <button 
          onClick={onCompleteSurvey}
          disabled={pendingRooms > 0}
          className="btn-success"
          title={pendingRooms > 0 ? 'Complete todos os cômodos primeiro' : ''}
        >
          ✅ Finalizar Vistoria
        </button>
        
        <button 
          onClick={onEditSurvey}
          className="btn-secondary"
        >
          ✏️ Editar Vistoria
        </button>
        
        <button 
          onClick={onGetSignature}
          className="btn-primary"
        >
          📝 Obter Assinatura
        </button>
      </div>
    </div>
  );
};

export default SurveyHeaderStats;