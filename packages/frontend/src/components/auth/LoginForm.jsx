import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import InputField from './InputField';
import SocialLogin from './SocialLogin';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ email, password });
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Entre com</h2>
      <SocialLogin />
      <div className="separator"><span>ou</span></div>
      <form onSubmit={handleSubmit} className="login-form">
        <InputField 
          type="email" 
          placeholder="E-mail" 
          icon="mail" 
          onChange={setEmail} 
        />
        <InputField 
          type="password" 
          placeholder="Senha" 
          icon="lock" 
          onChange={setPassword}
        />
        <Link to="/forgot-password" className="forgot-password-link">
          Esqueceu a senha?
        </Link>
        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <p className="signup-prompt">
        Não tem uma conta? <Link to="/register" className="signup-link">Cadastrar</Link>
      </p>
    </div>
  );
};

export default LoginForm;