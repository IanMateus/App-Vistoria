import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { surveyAppService } from '../services/surveyApp';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    engineers: 0,
    clients: 0,
    buildings: 0,
    surveys: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, buildingsData, surveysData] = await Promise.all([
        authService.getUsers(),
        surveyAppService.getBuildings(),
        surveyAppService.getSurveys()
      ]);

      const engineers = usersData.filter(user => user.role === 'engineer').length;
      const clients = usersData.filter(user => user.role === 'client').length;

      setUsers(usersData);
      setStats({
        totalUsers: usersData.length,
        engineers,
        clients,
        buildings: buildingsData.length,
        surveys: surveysData.length
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Erro ao carregar dados administrativos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando dados administrativos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>👑 Painel Administrativo</h2>
        <p>Gerencie todo o sistema de vistorias</p>
      </div>

      {/* Admin Stats */}
      <div className="stats-overview">
        <div className="stat-card admin-stat">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total de Usuários</p>
          </div>
        </div>
        <div className="stat-card admin-stat">
          <div className="stat-icon">🏗️</div>
          <div className="stat-info">
            <h3>{stats.engineers}</h3>
            <p>Engenheiros</p>
          </div>
        </div>
        <div className="stat-card admin-stat">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>{stats.clients}</h3>
            <p>Clientes</p>
          </div>
        </div>
        <div className="stat-card admin-stat">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h3>{stats.buildings}</h3>
            <p>Edifícios</p>
          </div>
        </div>
        <div className="stat-card admin-stat">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{stats.surveys}</h3>
            <p>Vistorias</p>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="admin-section">
        <h3>Gestão de Usuários</h3>
        <div className="users-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Empresa</th>
                <th>CREA</th>
                <th>Data de Registro</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'engineer' && '🏗️ Engenheiro'}
                      {user.role === 'admin' && '👑 Administrador'}
                      {user.role === 'client' && '👤 Cliente'}
                    </span>
                  </td>
                  <td>{user.company || '-'}</td>
                  <td>{user.licenseNumber || '-'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Actions */}
      <div className="admin-section">
        <h3>Ações do Sistema</h3>
        <div className="admin-actions">
          <button className="admin-action-btn">
            <div className="action-icon">📊</div>
            <span>Gerar Relatório Geral</span>
          </button>
          <button className="admin-action-btn">
            <div className="action-icon">🔄</div>
            <span>Backup do Sistema</span>
          </button>
          <button className="admin-action-btn">
            <div className="action-icon">⚙️</div>
            <span>Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;