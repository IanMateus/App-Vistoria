import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../../components/auth/InputField';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending reset password email
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="login-container">
        <h2 className="form-title">Verifique seu email</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Enviamos um link para redefinir sua senha para <strong>{email}</strong>.
        </p>
        <Link to="/login" className="signup-link" style={{ display: 'block', textAlign: 'center' }}>
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h2 className="form-title">Recuperar senha</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <InputField 
          type="email" 
          placeholder="E-mail" 
          icon="mail" 
          onChange={setEmail} 
        />
        <button type="submit" className="login-button">
          Enviar link de recuperação
        </button>
      </form>
      <p className="signup-prompt">
        Lembrou sua senha? <Link to="/login" className="signup-link">Entrar</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;