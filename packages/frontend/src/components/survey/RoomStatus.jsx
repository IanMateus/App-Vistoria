import React from 'react';
import { surveyAppService } from '../../services/surveyApp';

const RoomStatus = ({ room, onStatusChange, onAddIssue }) => {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({
    area: '',
    description: '',
    severity: 'medium',
    recommendedAction: '',
    estimatedCost: ''
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'inspected_ok': return '✅';
      case 'has_issues': return '⚠️';
      default: return '⏳';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'inspected_ok': return 'Inspecionado OK';
      case 'has_issues': return 'Com Problemas';
      default: return 'Pendente';
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await onStatusChange(room.id, newStatus);
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const handleAddIssue = async (e) => {
    e.preventDefault();
    try {
      const issueData = {
        ...issueForm,
        surveyId: room.surveyId,
        roomId: room.id,
        area: room.name
      };
      
      await onAddIssue(issueData);
      setIssueForm({
        area: '',
        description: '',
        severity: 'medium',
        recommendedAction: '',
        estimatedCost: ''
      });
      setShowIssueForm(false);
    } catch (error) {
      console.error('Error adding issue:', error);
      alert('Erro ao adicionar problema: ' + error.message);
    }
  };

  return (
    <div className={`room-status-card ${room.status}`}>
      <div className="room-header">
        <div className="room-info">
          <h5>{room.name}</h5>
          <span className={`status-badge status-${room.status}`}>
            {getStatusIcon(room.status)} {getStatusText(room.status)}
          </span>
        </div>
        
        <div className="room-actions">
          {room.status !== 'inspected_ok' && (
            <button
              onClick={() => handleStatusUpdate('inspected_ok')}
              className="btn-success"
              title="Marcar como OK"
            >
              ✅ OK
            </button>
          )}
          
          {room.status !== 'has_issues' && (
            <button
              onClick={() => {
                handleStatusUpdate('has_issues');
                setShowIssueForm(true);
              }}
              className="btn-warning"
              title="Marcar com problemas"
            >
              ⚠️ Problemas
            </button>
          )}

          <button
            onClick={() => setShowIssueForm(!showIssueForm)}
            className={`btn-secondary ${showIssueForm ? 'active' : ''}`}
          >
            {showIssueForm ? '✕' : '📝'}
          </button>
        </div>
      </div>

      {room.notes && (
        <div className="room-notes">
          <strong>Observações:</strong> {room.notes}
        </div>
      )}

      {showIssueForm && (
        <div className="issue-form">
          <h6>📝 Registrar Problema em {room.name}</h6>
          <form onSubmit={handleAddIssue}>
            <textarea
              placeholder="Descreva o problema encontrado..."
              value={issueForm.description}
              onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
              required
              className="form-input"
              rows="3"
            />

            <div className="form-row">
              <div className="form-group">
                <label>Gravidade:</label>
                <select
                  value={issueForm.severity}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, severity: e.target.value }))}
                  className="form-input"
                >
                  <option value="low">🟢 Baixa</option>
                  <option value="medium">🟡 Média</option>
                  <option value="high">🟠 Alta</option>
                  <option value="critical">🔴 Crítica</option>
                </select>
              </div>

              <div className="form-group">
                <label>Custo Estimado (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={issueForm.estimatedCost}
                  onChange={(e) => setIssueForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <textarea
              placeholder="Ação recomendada..."
              value={issueForm.recommendedAction}
              onChange={(e) => setIssueForm(prev => ({ ...prev, recommendedAction: e.target.value }))}
              className="form-input"
              rows="2"
            />

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                ➕ Adicionar Problema
              </button>
              <button 
                type="button" 
                onClick={() => setShowIssueForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Display existing issues */}
      {room.issues && room.issues.length > 0 && (
        <div className="room-issues">
          <h6>Problemas Registrados:</h6>
          {room.issues.map(issue => (
            <div key={issue.id} className="issue-item">
              <p><strong>Descrição:</strong> {issue.description}</p>
              <p><strong>Gravidade:</strong> 
                <span className={`severity-${issue.severity}`}>
                  {issue.severity === 'low' && '🟢 Baixa'}
                  {issue.severity === 'medium' && '🟡 Média'}
                  {issue.severity === 'high' && '🟠 Alta'}
                  {issue.severity === 'critical' && '🔴 Crítica'}
                </span>
              </p>
              {issue.recommendedAction && (
                <p><strong>Ação Recomendada:</strong> {issue.recommendedAction}</p>
              )}
              {issue.estimatedCost && (
                <p><strong>Custo Estimado:</strong> R$ {parseFloat(issue.estimatedCost).toFixed(2)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomStatus;