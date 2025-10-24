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
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    setIsLoading(true);
    setError('');
    
    try {
      const { name, email, password } = formData;
      const response = await authService.register({ name, email, password });
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