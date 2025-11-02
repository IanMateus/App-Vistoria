import React, { useState, useEffect } from 'react';
import { surveyAppService } from '../../services/surveyApp';

const SurveyInfoEditor = ({ survey, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    surveyDate: '',
    engineerNotes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (survey) {
      // Format date for datetime-local input
      const date = new Date(survey.surveyDate);
      const formattedDate = date.toISOString().slice(0, 16);
      
      setFormData({
        surveyDate: formattedDate,
        engineerNotes: survey.engineerNotes || ''
      });
    }
  }, [survey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedSurvey = await surveyAppService.updateSurvey(survey.id, formData);
      onSave(updatedSurvey);
    } catch (error) {
      console.error('Error updating survey:', error);
      alert('Erro ao atualizar vistoria: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>✏️ Editar Informações da Vistoria</h3>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Data e Horário da Vistoria *</label>
            <input
              type="datetime-local"
              value={formData.surveyDate}
              onChange={handleChange('surveyDate')}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Observações do Engenheiro</label>
            <textarea
              value={formData.engineerNotes}
              onChange={handleChange('engineerNotes')}
              placeholder="Observações iniciais sobre a vistoria..."
              rows="4"
              className="form-input"
            />
          </div>

          <div className="current-info">
            <h4>Informações Atuais</h4>
            <div className="info-grid">
              <div>
                <strong>Edifício:</strong> {survey.surveyBuilding?.name}
              </div>
              <div>
                <strong>Cliente:</strong> {survey.surveyClient?.name}
              </div>
              <div>
                <strong>Endereço:</strong> {survey.surveyBuilding?.address}
              </div>
              <div>
                <strong>Propriedade:</strong> {survey.surveyClient?.propertyNumber}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyInfoEditor;