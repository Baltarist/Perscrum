
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AuthProvider as AuthApiProvider } from './hooks/useAuthApi';
import { ProjectProvider } from './hooks/useProjectData';
import { ProjectApiProvider } from './hooks/useProjectApi';
import LoginPage from './components/LoginPage';
import LoginPageApi from './components/LoginPageApi';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteApi from './components/ProtectedRouteApi';
import MainLayout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import DashboardApi from './components/DashboardApi';
import KanbanBoard from './components/KanbanBoard';
import KanbanBoardApi from './components/KanbanBoardApi';
import Analytics from './components/Analytics';
import AnalyticsApi from './components/AnalyticsApi';
import CalendarView from './components/CalendarView';
import SettingsPage from './components/SettingsPage';
import SettingsPageApi from './components/SettingsPageApi';
import SprintReportPage from './components/SprintReportPage';
import SubscriptionPage from './components/SubscriptionPage';
import CheckoutPage from './components/CheckoutPage';
import LegalPage from './components/LegalPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthApiProvider>
        <AuthProvider>
          <ProjectApiProvider>
            <ProjectProvider>
              <Routes>
            <Route path="/login" element={<LoginPageApi />} />
            <Route path="/login-mock" element={<LoginPage />} />
            <Route 
              path="/*"
              element={
                <ProtectedRouteApi>
                  <MainLayout>
                    <Routes>
                      <Route path="dashboard" element={<DashboardApi />} />
                      <Route path="dashboard-mock" element={<Dashboard />} />
                      <Route path="project/:projectId" element={<KanbanBoardApi />} />
                      <Route path="project-mock/:projectId" element={<KanbanBoard />} />
                      <Route path="project/:projectId/report/:sprintId" element={<SprintReportPage />} />
                      <Route path="analytics" element={<AnalyticsApi />} />
                      <Route path="analytics-mock" element={<Analytics />} />
                      <Route path="calendar" element={<CalendarView />} />
                      <Route path="settings" element={<SettingsPageApi />} />
                      <Route path="settings-mock" element={<SettingsPage />} />
                      <Route path="subscription" element={<SubscriptionPage />} />
                      <Route path="checkout/:tier" element={<CheckoutPage />} />
                      <Route path="legal/:topic" element={<LegalPage />} />
                      <Route path="*" element={<Dashboard />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRouteApi>
              }
            />
              </Routes>
            </ProjectProvider>
          </ProjectApiProvider>
        </AuthProvider>
      </AuthApiProvider>
    </HashRouter>
  );
};

export default App;