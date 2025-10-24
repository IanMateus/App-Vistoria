import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import UserTable from '../components/ui/UserTable';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await authService.getUsers();
        setUsers(usersData);
      } catch (err) {
        setError(err.message || 'Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Bem-vindo, {user?.name}!</h2>
        <button onClick={logout} className="btn-logout">Sair</button>
      </div>
      
      <div className="user-info">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>ID:</strong> {user?.id}</p>
      </div>
      
      <div className="users-list">
        <h3>Usuários Cadastrados</h3>
        <UserTable 
          loading={loading} 
          error={error} 
          users={users} 
        />
      </div>
    </div>
  );
};

export default Dashboard;