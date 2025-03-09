import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./scenes/auth/Login";
import Register from "./scenes/auth/Register";
import ResetPassword from "./scenes/auth/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Profile from "./scenes/profile/Profile";
import ErrorBoundary from "./components/ErrorBoundary";
import { LinearProgress } from "@mui/material";
import Supplychain from "./scenes/supplychain";
import OrderDetail from "./pages/OrderDetail";
import RevitModels from "./scenes/revitmodels";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return <LinearProgress />
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          {!user ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <div className="app">
              <Sidebar isSidebar={isSidebar} />
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} />
                <Routes>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/pie" element={<Pie />} />
                  <Route path="/line" element={<Line />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/geography" element={<Geography />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/supplychain" element={<Supplychain />} />
                  <Route path="/revitmodels" element={<RevitModels />} />
                  <Route path="/orderDetail/:id" element={<OrderDetail />} />
                </Routes>
              </main>
            </div>
          )}
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
