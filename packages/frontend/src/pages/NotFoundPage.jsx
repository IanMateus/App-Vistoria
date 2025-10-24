import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();
    
    return (
        <div className="not-found-container">
            <h1>Página não encontrada!</h1>
            <p>A página que você está procurando não existe.</p>
            <button onClick={() => navigate('/')}>Voltar para o início</button>
        </div>
    );
}

export default NotFoundPage;