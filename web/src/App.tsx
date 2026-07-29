import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.tsx';
import { AppShell } from './components/Layout/AppShell.tsx';
import { RoleGuard } from './components/Layout/RoleGuard.tsx';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import IncidentsPage from './pages/IncidentsPage.tsx';
import DriversPage from './pages/DriversPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';
import SettingsPage from './pages/SettingsPage.tsx';
import SimPage from './pages/SimPage.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/sim"
              element={
                <RoleGuard allow={['admin']}>
                  <SimPage />
                </RoleGuard>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
