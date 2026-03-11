import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import NewNotePage from './pages/NewNotePage';
import WorkspacesPage from './pages/WorkspacesPage';
import ScorePage from './pages/ScorePage';
import FeedPage from './pages/FeedPage';
import InterviewPage from './pages/InterviewPage';
import HelpPage from './pages/HelpPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/notes" element={<PrivateRoute><NotesPage /></PrivateRoute>} />
      <Route path="/notes/new" element={<PrivateRoute><NewNotePage /></PrivateRoute>} />
      <Route path="/workspaces" element={<PrivateRoute><WorkspacesPage /></PrivateRoute>} />
      <Route path="/score" element={<PrivateRoute><ScorePage /></PrivateRoute>} />
      <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
      <Route path="/interview" element={<PrivateRoute><InterviewPage /></PrivateRoute>} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
