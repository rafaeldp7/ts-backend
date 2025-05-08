import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import Layout from "scenes/layout";
import Overview from "scenes/overview";
import MapAndTraffic from "scenes/mapsAndTraffic";
import Settings from "scenes/settings";
import UserManagement from "scenes/userManagement";
import Reports from "scenes/Reports";
import SystemLogsAndSecurity from "scenes/systemLogsAndSecurity";
import TripAnalytics from "scenes/tripAnalytics";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/UserManagement" element={<UserManagement />} />
              <Route path="/TripAnalytics" element={<TripAnalytics />} />
              <Route path="/MapsAndTraffic" element={<MapAndTraffic />} />
              <Route path="/Reports" element={<Reports />} />
              <Route path="/SystemLogsAndSecurity" element={<SystemLogsAndSecurity />} />
              <Route path="/Settings" element={<Settings />} />

            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;