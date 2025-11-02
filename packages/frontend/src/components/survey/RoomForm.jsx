import React, { useState, useEffect } from 'react';

const RoomForm = ({ room, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'pending',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        status: room.status || 'pending',
        notes: room.notes || ''
      });
    }
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor, informe o nome do cômodo');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving room:', error);
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
      <div className="modal-content">
        <div className="modal-header">
          <h3>{room ? '✏️ Editar Cômodo' : '➕ Adicionar Cômodo'}</h3>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome do Cômodo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="Ex: Sala, Cozinha, Quarto Principal..."
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select 
              value={formData.status} 
              onChange={handleChange('status')}
              className="form-input"
            >
              <option value="pending">⏳ Pendente</option>
              <option value="inspected_ok">✅ OK (Sem problemas)</option>
              <option value="has_issues">⚠️ Com problemas</option>
              <option value="in_progress">🔍 Em inspeção</option>
            </select>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={formData.notes}
              onChange={handleChange('notes')}
              placeholder="Observações sobre este cômodo..."
              rows="3"
              className="form-input"
            />
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
              {saving ? 'Salvando...' : (room ? 'Atualizar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;