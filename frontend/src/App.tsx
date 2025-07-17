import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import UserManagement from './pages/UserManagement';
import SettingsLayout from './pages/SettingsLayout';
import NotificationSettings from './pages/NotificationSettings';
import ProfileSettings from './pages/ProfileSettings';
import GeneralSettings from './pages/GeneralSettings';
import KnowledgeBase from './pages/KnowledgeBase';
import ArticleDetail from './pages/ArticleDetail';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tickets">
          <Route index element={<TicketList />} />
          <Route path="new" element={<CreateTicket />} />
          <Route path=":id" element={<TicketDetail />} />
        </Route>
        <Route path="knowledge-base">
          <Route index element={<KnowledgeBase />} />
          <Route path=":slug" element={<ArticleDetail />} />
        </Route>
        <Route path="users" element={<UserManagement />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="general" element={<GeneralSettings />} />
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
