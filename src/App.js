import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import { AuthProvider } from "contexts/AuthContext";
import { AdminAuthProvider } from "contexts/AdminAuthContext";
import ProtectedRoute from "components/ProtectedRoute";
import ProtectedAdminRoute from "components/ProtectedAdminRoute";
import Layout from "scenes/layout";
import Overview from "scenes/overview";
import Dashboard from "scenes/dashboard";
import SearchPage from "scenes/search";
import MapAndTraffic from "scenes/mapsAndTraffic";
import Settings from "scenes/settings";
import UserManagement from "scenes/userManagement";
import Reports from "scenes/Reports";
import SystemLogsAndSecurity from "scenes/systemLogsAndSecurity";
import TripAnalytics from "scenes/tripAnalytics";
import AdminLogin from "components/AdminLogin";
import AdminManagement from "scenes/adminManagement";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <div className="app">
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedAdminRoute>
                    <Dashboard />
                  </ProtectedAdminRoute>
                } />
                <Route path="/admin/management" element={
                  <ProtectedAdminRoute requiredPermission="canRead">
                    <AdminManagement />
                  </ProtectedAdminRoute>
                } />
                
                {/* Regular App Routes */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/overview" element={
                    <ProtectedRoute>
                      <Overview />
                    </ProtectedRoute>
                  } />
                  <Route path="/search" element={
                    <ProtectedRoute>
                      <SearchPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/UserManagement" element={
                    <ProtectedRoute>
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/TripAnalytics" element={
                    <ProtectedRoute>
                      <TripAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/MapsAndTraffic" element={
                    <ProtectedRoute>
                      <MapAndTraffic />
                    </ProtectedRoute>
                  } />
                  <Route path="/Reports" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  <Route path="/SystemLogsAndSecurity" element={
                    <ProtectedRoute>
                      <SystemLogsAndSecurity />
                    </ProtectedRoute>
                  } />
                  <Route path="/Settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                </Route>
              </Routes>
            </ThemeProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;