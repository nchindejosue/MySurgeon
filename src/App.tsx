import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { FindSurgeon } from './components/patient/FindSurgeon';
import { HealthProfile } from './components/patient/HealthProfile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const AuthWrapper: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return isSignUp ? (
    <SignUp onToggleMode={() => setIsSignUp(false)} />
  ) : (
    <SignIn onToggleMode={() => setIsSignUp(true)} />
  );
};

const DashboardLayout: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    if (profile?.role === 'patient') {
      switch (activeTab) {
        case 'dashboard':
          return <PatientDashboard />;
        case 'find-surgeon':
          return <FindSurgeon />;
        case 'health-profile':
          return <HealthProfile />;
        default:
          return <PatientDashboard />;
      }
    } else if (profile?.role === 'surgeon') {
      switch (activeTab) {
        case 'dashboard':
          return <div>Surgeon Dashboard (Coming Soon)</div>;
        case 'patients':
          return <div>My Patients (Coming Soon)</div>;
        case 'schedule':
          return <div>My Schedule (Coming Soon)</div>;
        case 'profile':
          return <div>Profile (Coming Soon)</div>;
        default:
          return <div>Surgeon Dashboard (Coming Soon)</div>;
      }
    } else if (profile?.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'analytics':
          return <div>Analytics (Coming Soon)</div>;
        case 'reports':
          return <div>Reports (Coming Soon)</div>;
        default:
          return <AdminDashboard />;
      }
    }

    return <div>Unknown role</div>;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthWrapper />;
  }

  return <DashboardLayout />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;