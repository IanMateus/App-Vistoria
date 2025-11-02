import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { surveyAppService } from '../services/surveyApp';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    buildings: 0,
    clients: 0,
    surveys: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      if (user?.role === 'engineer' || user?.role === 'admin') {
        const [buildingsData, clientsData, surveysData] = await Promise.all([
          surveyAppService.getBuildings(),
          surveyAppService.getClients(),
          surveyAppService.getSurveys()
        ]);

        setStats({
          buildings: buildingsData.length,
          clients: clientsData.length,
          surveys: surveysData.length
        });
      } else if (user?.role === 'client') {
        const [buildingsData, surveysData] = await Promise.all([
          surveyAppService.getClientBuildings(),
          surveyAppService.getClientSurveys()
        ]);

        setStats({
          buildings: buildingsData.length,
          clients: 0, // Clients don't see client count
          surveys: surveysData.length
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      if (user?.role === 'admin') {
        const usersData = await authService.getUsers();
        setUsers(usersData);
      }
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStats(), fetchUsers()]);
    };
    loadData();
  }, [user]);

  const isEngineerOrAdmin = user?.role === 'engineer' || user?.role === 'admin';
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Bem-vindo, {user?.name}!</h2>
        <div className="header-actions">
          <span className="user-role-badge">
            {user?.role === 'engineer' && '🏗️ Engenheiro'}
            {user?.role === 'admin' && '👑 Administrador'}
            {user?.role === 'client' && '👤 Cliente'}
          </span>
          <button onClick={logout} className="btn-logout">Sair</button>
        </div>
      </div>
      
      <div className="user-info">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>ID:</strong> {user?.id}</p>
        {user?.company && <p><strong>Empresa:</strong> {user.company}</p>}
        {user?.licenseNumber && <p><strong>CREA:</strong> {user.licenseNumber}</p>}
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.buildings}</h3>
            <p>{isClient ? 'Meus Edifícios' : 'Edifícios'}</p>
          </div>
        </div>
        {!isClient && (
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.clients}</h3>
              <p>Clientes</p>
            </div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.surveys}</h3>
            <p>{isClient ? 'Minhas Vistorias' : 'Vistorias'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Different for each role */}
      <div className="navigation-menu">
        <h3>Sistema de Vistoria de Apartamentos</h3>
        <div className="nav-buttons">
          {isEngineerOrAdmin && (
            <>
              <Link to="/buildings" className="nav-button">
                <div className="nav-icon">🏢</div>
                <span>Gerenciar Edifícios</span>
              </Link>
              <Link to="/clients" className="nav-button">
                <div className="nav-icon">👥</div>
                <span>Gerenciar Clientes</span>
              </Link>
              <Link to="/surveys" className="nav-button">
                <div className="nav-icon">📋</div>
                <span>Vistorias Agendadas</span>
              </Link>
            </>
          )}
          
          {isClient && (
            <>
              <Link to="/my-buildings" className="nav-button">
                <div className="nav-icon">🏢</div>
                <span>Meus Edifícios</span>
              </Link>
              <Link to="/my-surveys" className="nav-button">
                <div className="nav-icon">📋</div>
                <span>Minhas Vistorias</span>
              </Link>
              <Link to="/reports" className="nav-button">
                <div className="nav-icon">📊</div>
                <span>Meus Relatórios</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" className="nav-button">
              <div className="nav-icon">👑</div>
              <span>Painel Admin</span>
            </Link>
          )}
        </div>
      </div>

      {/* Admin-only: Users List */}
      {isAdmin && (
        <div className="users-list">
          <h3>Usuários do Sistema</h3>
          {loading ? (
            <p>Carregando...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.role === 'engineer' ? '🏗️ Engenheiro' : 
                       user.role === 'admin' ? '👑 Admin' : '👤 Cliente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;