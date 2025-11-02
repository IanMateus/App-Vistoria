import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import Dashboard from '../pages/Dashboard';
import BuildingsPage from '../pages/BuildingsPage';
import ClientsPage from '../pages/ClientsPage';
import SurveysPage from '../pages/SurveysPage';
import LiveSurveyPage from '../pages/LiveSurveyPage'; // NEW
import ClientBuildingsPage from '../pages/ClientBuildingsPage';
import ClientSurveysPage from '../pages/ClientSurveysPage';
import AdminPage from '../pages/AdminPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function AppContent() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      {/* Engineer/Admin Routes */}
      <Route 
        path="/buildings" 
        element={
          <ProtectedRoute>
            <BuildingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clients" 
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/surveys" 
        element={
          <ProtectedRoute>
            <SurveysPage />
          </ProtectedRoute>
        } 
      />
      {/* NEW: Live Survey Route */}
      <Route 
        path="/live-survey/:surveyId" 
        element={
          <ProtectedRoute>
            <LiveSurveyPage />
          </ProtectedRoute>
        } 
      />

      {/* Client Routes */}
      <Route 
        path="/my-buildings" 
        element={
          <ProtectedRoute>
            <ClientBuildingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-surveys" 
        element={
          <ProtectedRoute>
            <ClientSurveysPage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } 
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <main>
          <AppContent />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;