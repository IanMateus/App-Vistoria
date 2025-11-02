import React, { useState, useEffect } from 'react';

const IssueForm = ({ issue, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    area: '',
    description: '',
    severity: 'medium',
    status: 'pending',
    recommendedAction: '',
    estimatedCost: '',
    photo: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (issue) {
      setFormData({
        area: issue.area || '',
        description: issue.description || '',
        severity: issue.severity || 'medium',
        status: issue.status || 'pending',
        recommendedAction: issue.recommendedAction || '',
        estimatedCost: issue.estimatedCost || '',
        photo: issue.photo || ''
      });
    }
  }, [issue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.area.trim() || !formData.description.trim()) {
      alert('Por favor, preencha a área e descrição do problema');
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null
      };
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving issue:', error);
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the file and get a URL
      // For now, we'll just store the file name
      setFormData(prev => ({
        ...prev,
        photo: file.name
      }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{issue ? '✏️ Editar Problema' : '➕ Adicionar Problema'}</h3>
          <button onClick={onCancel} className="btn-close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Área/Local *</label>
            <input
              type="text"
              value={formData.area}
              onChange={handleChange('area')}
              placeholder="Ex: Piso, Parede, Janela, Teto..."
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Descrição do Problema *</label>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Descreva detalhadamente o problema encontrado..."
              rows="3"
              required
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gravidade</label>
              <select 
                value={formData.severity} 
                onChange={handleChange('severity')}
                className="form-input"
              >
                <option value="low">🟢 Baixa</option>
                <option value="medium">🟡 Média</option>
                <option value="high">🟠 Alta</option>
                <option value="critical">🔴 Crítica</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select 
                value={formData.status} 
                onChange={handleChange('status')}
                className="form-input"
              >
                <option value="pending">⏳ Pendente</option>
                <option value="in_progress">🔧 Em Andamento</option>
                <option value="fixed">✅ Corrigido</option>
                <option value="wont_fix">❌ Não Corrigir</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ação Recomendada</label>
            <textarea
              value={formData.recommendedAction}
              onChange={handleChange('recommendedAction')}
              placeholder="Recomendações para correção do problema..."
              rows="2"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Custo Estimado (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={handleChange('estimatedCost')}
                placeholder="0,00"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Foto (Opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="form-input"
              />
              {formData.photo && (
                <div className="photo-preview">
                  📎 {formData.photo}
                </div>
              )}
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
              {saving ? 'Salvando...' : (issue ? 'Atualizar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;