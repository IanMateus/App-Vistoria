import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import InputField from './InputField';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client', // Default role
    licenseNumber: '',
    company: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Prepare data for API
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    // Add engineer-specific fields if role is engineer
    if (formData.role === 'engineer') {
      submitData.licenseNumber = formData.licenseNumber;
      submitData.company = formData.company;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.register(submitData);
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="form-title">Criar Conta</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <InputField 
          type="text" 
          placeholder="Nome completo" 
          icon="person" 
          onChange={handleChange('name')} 
        />
        <InputField 
          type="email" 
          placeholder="E-mail" 
          icon="mail" 
          onChange={handleChange('email')} 
        />
        <InputField 
          type="password" 
          placeholder="Senha" 
          icon="lock" 
          onChange={handleChange('password')}
        />
        <InputField 
          type="password" 
          placeholder="Confirmar senha" 
          icon="lock" 
          onChange={handleChange('confirmPassword')}
        />

        {/* Role Selection */}
        <div className="role-selection">
          <label>Tipo de Conta:</label>
          <div className="role-options">
            <button
              type="button"
              className={`role-button ${formData.role === 'client' ? 'active' : ''}`}
              onClick={() => handleRoleChange('client')}
            >
              👤 Cliente
            </button>
            <button
              type="button"
              className={`role-button ${formData.role === 'engineer' ? 'active' : ''}`}
              onClick={() => handleRoleChange('engineer')}
            >
              🏗️ Engenheiro
            </button>
          </div>
        </div>

        {/* Engineer-specific fields */}
        {formData.role === 'engineer' && (
          <div className="engineer-fields">
            <InputField 
              type="text" 
              placeholder="Número do CREA" 
              icon="badge" 
              onChange={handleChange('licenseNumber')}
            />
            <InputField 
              type="text" 
              placeholder="Empresa" 
              icon="business" 
              onChange={handleChange('company')}
            />
          </div>
        )}

        <button 
          type="submit" 
          className="register-button"
          disabled={isLoading}
        >
          {isLoading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="signup-prompt">
        Já tem uma conta? <Link to="/login" className="signup-link">Entrar</Link>
      </p>
    </div>
  );
};

export default RegisterForm;