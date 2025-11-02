import React, { useState } from 'react';

const IssueItem = ({ issue, onEdit, onDelete, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('Erro ao atualizar status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in_progress': return '🔧';
      case 'fixed': return '✅';
      case 'wont_fix': return '❌';
      default: return '⚪';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Andamento';
      case 'fixed': return 'Corrigido';
      case 'wont_fix': return 'Não Corrigir';
      default: return status;
    }
  };

  return (
    <div className={`issue-item severity-${issue.severity} status-${issue.status}`}>
      <div className="issue-header">
        <div className="issue-title">
          <h6>{issue.area}</h6>
          <div className="issue-badges">
            <span className={`severity-badge severity-${issue.severity}`}>
              {getSeverityIcon(issue.severity)} {issue.severity}
            </span>
            <span className={`status-badge status-${issue.status}`}>
              {getStatusIcon(issue.status)} {getStatusText(issue.status)}
            </span>
          </div>
        </div>
        <div className="issue-actions">
          <button 
            onClick={() => handleStatusChange('fixed')}
            disabled={updating || issue.status === 'fixed'}
            className={`btn-status ${issue.status === 'fixed' ? 'active' : ''}`}
            title="Marcar como corrigido"
          >
            {updating ? '...' : '✅'}
          </button>
          <button onClick={onEdit} className="btn-edit" title="Editar problema">
            ✏️
          </button>
          <button onClick={onDelete} className="btn-delete" title="Excluir problema">
            🗑️
          </button>
        </div>
      </div>

      <div className="issue-content">
        <p className="issue-description">{issue.description}</p>
        
        {issue.recommendedAction && (
          <div className="issue-detail">
            <strong>Ação recomendada:</strong> {issue.recommendedAction}
          </div>
        )}

        {issue.estimatedCost && (
          <div className="issue-detail">
            <strong>Custo estimado:</strong> R$ {parseFloat(issue.estimatedCost).toFixed(2)}
          </div>
        )}

        {issue.photo && (
          <div className="issue-photo">
            <strong>Foto:</strong> 
            <span className="photo-link">📎 {issue.photo}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueItem;