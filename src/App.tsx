import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
          return <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Surgeon Dashboard</h2>
            <p className="text-neutral-600">Coming Soon - Manage your patients and surgical cases</p>
          </div>;
        case 'patients':
          return <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">My Patients</h2>
            <p className="text-neutral-600">Coming Soon - View and manage your patient list</p>
          </div>;
        case 'schedule':
          return <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">My Schedule</h2>
            <p className="text-neutral-600">Coming Soon - Manage your surgical schedule</p>
          </div>;
        case 'profile':
          return <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Profile</h2>
            <p className="text-neutral-600">Coming Soon - Manage your professional profile</p>
          </div>;
        default:
          return <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Surgeon Dashboard</h2>
            <p className="text-neutral-600">Coming Soon</p>
          </div>;
      }
    } else if (profile?.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'analytics':
          return <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Analytics</h2>
            <p className="text-neutral-600">Coming Soon - Advanced analytics and insights</p>
          </div>;
        case 'reports':
          return <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Reports</h2>
            <p className="text-neutral-600">Coming Soon - Generate detailed reports</p>
          </div>;
        default:
          return <AdminDashboard />;
      }
    }

    return <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">Unknown Role</h2>
      <p className="text-neutral-600">Please contact support</p>
    </div>;
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