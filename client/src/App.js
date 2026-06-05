import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Checklist from './pages/Checklist';
import Packing from './pages/Packing';
import Shopping from './pages/Shopping';
import Goals from './pages/Goals';
import Meals from './pages/Meals';
import French from './pages/French';
import BucketList from './pages/BucketList';
import Journal from './pages/Journal';
import Notes from './pages/Notes';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font-script)', fontSize: '1.5rem', color: 'var(--rouge)' }}>
      Chargement...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/checklist"  element={<Checklist />} />
            <Route path="/packing"    element={<Packing />} />
            <Route path="/shopping"   element={<Shopping />} />
            <Route path="/goals"      element={<Goals />} />
            <Route path="/meals"      element={<Meals />} />
            <Route path="/french"     element={<French />} />
            <Route path="/bucketlist" element={<BucketList />} />
            <Route path="/journal"    element={<Journal />} />
            <Route path="/notes"      element={<Notes />} />
            <Route path="/analytics"  element={<Analytics />} />
            <Route path="/settings"   element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
