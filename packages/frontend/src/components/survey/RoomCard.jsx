import React, { useState } from 'react';
import { surveyAppService } from '../../services/surveyApp';
import IssueForm from './IssueForm';
import IssueItem from './IssueItem';

const RoomCard = ({ 
  room, 
  issues, 
  onEdit, 
  onDelete, 
  onRoomUpdated, 
  onIssueAdded, 
  onIssueUpdated, 
  onIssueDeleted 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [markingAllAsOk, setMarkingAllAsOk] = useState(false);

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedRoom = await surveyAppService.updateRoomStatus(room.id, { 
        status: newStatus 
      });
      onRoomUpdated(updatedRoom);
    } catch (error) {
      console.error('Error updating room status:', error);
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  // NEW: Mark all issues in the room as fixed
  const handleMarkAllIssuesAsOk = async () => {
    if (issues.length === 0) return;
    
    if (!window.confirm(`Deseja marcar todos os ${issues.length} problema(s) deste cômodo como corrigidos?`)) {
      return;
    }

    setMarkingAllAsOk(true);
    try {
      // Update each issue to 'fixed' status
      const updatePromises = issues.map(issue => 
        surveyAppService.updateIssue(issue.id, { status: 'fixed' })
      );
      
      const updatedIssues = await Promise.all(updatePromises);
      
      // Update all issues in parent state
      updatedIssues.forEach(updatedIssue => {
        onIssueUpdated(updatedIssue);
      });
      
      // Update room status to inspected_ok
      await handleStatusChange('inspected_ok');
      
    } catch (error) {
      console.error('Error marking all issues as OK:', error);
      alert('Erro ao marcar problemas como corrigidos: ' + error.message);
    } finally {
      setMarkingAllAsOk(false);
    }
  };

  const handleAddIssue = async (issueData) => {
    try {
      const newIssue = await surveyAppService.createIssue({
        ...issueData,
        roomId: room.id,
        surveyId: room.surveyId
      });
      onIssueAdded(newIssue);
      setShowIssueForm(false);
      
      // Update room status to has_issues if not already
      if (room.status !== 'has_issues') {
        await surveyAppService.updateRoomStatus(room.id, { status: 'has_issues' });
        onRoomUpdated({ ...room, status: 'has_issues' });
      }
    } catch (error) {
      console.error('Error adding issue:', error);
      throw error;
    }
  };

  const handleUpdateIssue = async (issueId, updateData) => {
    try {
      const updatedIssue = await surveyAppService.updateIssue(issueId, updateData);
      onIssueUpdated(updatedIssue);
      setShowIssueForm(false);
      setEditingIssue(null);
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  };

  const handleEditIssueSave = async (issueData) => {
    if (!editingIssue) {
      console.error('No issue to edit');
      return;
    }
    await handleUpdateIssue(editingIssue.id, issueData);
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
    setShowIssueForm(true);
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Tem certeza que deseja excluir este problema?')) {
      return;
    }

    try {
      await surveyAppService.deleteIssue(issueId);
      onIssueDeleted(issueId);
      
      // If no more issues, update room status
      const remainingIssues = issues.filter(issue => issue.id !== issueId);
      if (remainingIssues.length === 0 && room.status === 'has_issues') {
        await surveyAppService.updateRoomStatus(room.id, { status: 'inspected_ok' });
        onRoomUpdated({ ...room, status: 'inspected_ok' });
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Erro ao excluir problema: ' + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'inspected_ok': return '✅';
      case 'has_issues': return '⚠️';
      case 'in_progress': return '🔍';
      default: return '⏳';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'inspected_ok': return 'OK';
      case 'has_issues': return 'Com Problemas';
      case 'in_progress': return 'Em Inspeção';
      default: return 'Pendente';
    }
  };

  const pendingIssuesCount = issues.filter(issue => issue.status !== 'fixed').length;

  return (
    <div className={`room-card ${room.status} ${expanded ? 'expanded' : ''}`}>
      {/* Room Header */}
      <div className="room-header" onClick={() => setExpanded(!expanded)}>
        <div className="room-info">
          <div className="room-title">
            <span className="room-icon">🚪</span>
            <h4>{room.name}</h4>
            {issues.length > 0 && (
              <span className="room-issues-badge">
                {issues.length} problema{issues.length !== 1 ? 's' : ''}
                {pendingIssuesCount > 0 && (
                  <span className="pending-issues"> ({pendingIssuesCount} pendentes)</span>
                )}
              </span>
            )}
          </div>
          <div className="room-status">
            <span className={`status-badge status-${room.status}`}>
              {getStatusIcon(room.status)} {getStatusText(room.status)}
            </span>
          </div>
        </div>
        <div className="room-actions" onClick={(e) => e.stopPropagation()}>
          {/* NEW: Mark all issues as OK button */}
          {issues.length > 0 && pendingIssuesCount > 0 && (
            <button 
              onClick={handleMarkAllIssuesAsOk}
              disabled={markingAllAsOk}
              className="btn-success"
              title="Marcar todos os problemas como corrigidos"
            >
              {markingAllAsOk ? '...' : '✅ Todos OK'}
            </button>
          )}
          
          <button 
            onClick={() => handleStatusChange('inspected_ok')}
            className={`btn-status ${room.status === 'inspected_ok' ? 'active' : ''}`}
            title="Marcar cômodo como OK"
          >
            ✅
          </button>
          <button 
            onClick={() => handleStatusChange('has_issues')}
            className={`btn-status ${room.status === 'has_issues' ? 'active' : ''}`}
            title="Marcar cômodo com problemas"
          >
            ⚠️
          </button>
          <button onClick={onEdit} className="btn-edit" title="Editar cômodo">
            ✏️
          </button>
          <button onClick={onDelete} className="btn-delete" title="Excluir cômodo">
            🗑️
          </button>
          <button 
            className={`btn-expand ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="room-content">
          {/* Room Notes */}
          {room.notes && (
            <div className="room-notes">
              <strong>Observações:</strong> {room.notes}
            </div>
          )}

          {/* Issues Section */}
          <div className="issues-section">
            <div className="issues-header">
              <h5>Problemas Identificados</h5>
              <button 
                onClick={() => {
                  setEditingIssue(null);
                  setShowIssueForm(true);
                }}
                className="btn-primary"
              >
                ➕ Adicionar Problema
              </button>
            </div>

            {issues.length === 0 ? (
              <div className="empty-issues">
                <p>Nenhum problema identificado neste cômodo.</p>
              </div>
            ) : (
              <div className="issues-list">
                {issues.map(issue => (
                  <IssueItem
                    key={issue.id}
                    issue={issue}
                    onEdit={() => handleEditIssue(issue)}
                    onDelete={() => handleDeleteIssue(issue.id)}
                    onStatusChange={(newStatus) => handleUpdateIssue(issue.id, { status: newStatus })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Issue Form Modal */}
      {showIssueForm && (
        <IssueForm
          issue={editingIssue}
          onSave={editingIssue ? handleEditIssueSave : handleAddIssue}
          onCancel={() => {
            setShowIssueForm(false);
            setEditingIssue(null);
          }}
        />
      )}
    </div>
  );
};

export default RoomCard;