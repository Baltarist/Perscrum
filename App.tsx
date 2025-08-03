
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProjectProvider } from './hooks/useProjectData';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import Analytics from './components/Analytics';
import CalendarView from './components/CalendarView';
import SettingsPage from './components/SettingsPage';
import SprintReportPage from './components/SprintReportPage';
import SubscriptionPage from './components/SubscriptionPage';
import CheckoutPage from './components/CheckoutPage';
import LegalPage from './components/LegalPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ProjectProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="project/:projectId" element={<KanbanBoard />} />
                      <Route path="project/:projectId/report/:sprintId" element={<SprintReportPage />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="calendar" element={<CalendarView />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                      <Route path="checkout/:tier" element={<CheckoutPage />} />
                      <Route path="legal/:topic" element={<LegalPage />} />
                      <Route path="*" element={<Dashboard />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ProjectProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;