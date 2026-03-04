import React, { useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ViewState } from './types';
import { COLORS } from './constants';
import ImpactTracker from './components/ImpactTracker'; // Import component

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const HeatmapPage = React.lazy(() => import('./components/HeatmapPage'));
const ChartsPage = React.lazy(() => import('./components/ChartsPage'));
const ReportsPage = React.lazy(() => import('./components/ReportsPage'));
const AlertsPage = React.lazy(() => import('./components/AlertsPage'));
const PolicyPage = React.lazy(() => import('./components/PolicyPage'));
const ProfilePage = React.lazy(() => import('./components/ProfilePage'));

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 animate-in fade-in duration-300">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
    <p className="text-sm font-medium">Loading module...</p>
  </div>
);

// Full screen loading for auth check
const AuthLoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
    <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
    <p className="text-slate-400 text-sm">Verifying authentication...</p>
  </div>
);

// Protected dashboard content
const DashboardContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.HEATMAP:
        return <HeatmapPage />;
      case ViewState.CHARTS:
        return <ChartsPage />;
      case ViewState.REPORTS:
        return <ReportsPage />;
      case ViewState.ALERTS:
        return <AlertsPage />;
      case ViewState.POLICY:
        return <PolicyPage />;
      case ViewState.IMPACT:
        return <ImpactTracker />;
      case ViewState.PROFILE:
        return <ProfilePage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-gray-800">{currentView} View</h2>
            <p className="text-gray-500 mt-2">This module is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <Header onViewChange={setCurrentView} />
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="ml-60 pt-16 min-h-screen transition-all duration-300">
        <div className="p-8 max-w-[1920px] mx-auto">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {renderContent()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

// Main app with auth routing
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show dashboard if authenticated
  return <DashboardContent />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
