import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import VisitorRegistration from './components/VisitorRegistration';
import CSOApproval from './components/CSOApproval';
import ExitLog from './components/ExitLog';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user, userRole, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user || !userRole) {
    return <Login />;
  }

  const getDefaultView = () => {
    if (userRole === 'reception') return 'register';
    if (userRole === 'cso') return 'approval';
    if (userRole === 'admin') return 'dashboard';
    return 'dashboard';
  };

  const view = currentView || getDefaultView();

  const renderView = () => {
    switch (view) {
      case 'register':
        return <VisitorRegistration />;
      case 'approval':
        return <CSOApproval />;
      case 'exit':
        return <ExitLog />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={view} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
