import React, { useState } from 'react';
import { surveyAppService } from '../../services/surveyApp';

const LiveSurveyRoom = ({ surveyId, onRoomAdded, onRoomUpdated }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    status: 'pending',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const roomData = {
        ...formData,
        surveyId: parseInt(surveyId)
      };
      
      const newRoom = await surveyAppService.createRoom(roomData);
      onRoomAdded(newRoom);
      
      setFormData({ name: '', status: 'pending', notes: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Erro ao adicionar cômodo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const updatedRoom = await surveyAppService.updateRoomStatus(roomId, {
        status: newStatus
      });
      onRoomUpdated(updatedRoom);
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Erro ao atualizar cômodo: ' + error.message);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="live-survey-room">
      <div className="section-header">
        <h4>🚪 Gerenciar Cômodos</h4>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '✕ Cancelar' : '+ Novo Cômodo'}
        </button>
      </div>

      {showForm && (
        <div className="room-form-card">
          <h5>Adicionar Cômodo</h5>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nome do cômodo (ex: Sala, Cozinha, Quarto 1)"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              className="form-input"
            />
            
            <textarea
              placeholder="Observações (opcional)"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              className="form-input"
              rows="3"
            />

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Adicionando...' : '➕ Adicionar Cômodo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveSurveyRoom;