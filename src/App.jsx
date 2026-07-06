import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Personal from './pages/Personal';
import PersonalDetail from './pages/PersonalDetail';
import Settle from './pages/Settle';
import Add from './pages/Add';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>LOADING LEDGER…</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected — with nav layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/groups" element={
              <ProtectedRoute>
                <AppLayout><Groups /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/groups/:id" element={
              <ProtectedRoute>
                <AppLayout><GroupDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/personal" element={
              <ProtectedRoute>
                <AppLayout><Personal /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/personal/:contactId" element={
              <ProtectedRoute>
                <AppLayout><PersonalDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settle" element={
              <ProtectedRoute>
                <AppLayout><Settle /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/add" element={
              <ProtectedRoute>
                <AppLayout><Add /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
