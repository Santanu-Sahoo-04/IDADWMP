import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from '@google-recaptcha/react';
import { UserProvider } from './context/UserContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { lightTheme, darkTheme } from './theme.js';
import TopBar from './components/TopBar/TopBar';

import { FontSizeProvider } from './contexts/FontSizeContext';

import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import Welcome from './pages/Welcome';
import Login1 from './pages/Login1';
import Login2 from './pages/Login2';
import UserDashboard from './pages/UserDashboard';
import SalesDashboard from './pages/SalesDashboard';
import ProductionDashboard from './pages/ProductionDashboard';
import HRDashboard from './pages/HRDashboard';
import UploadPage from './pages/UploadPage';
import EditCsvPage from './pages/EditCsvPage';

import './i18n';

import UserManagementPage from './pages/UserManagementPage'; 

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  return (
    <GoogleReCaptchaProvider reCaptchaKey="YOUR_SITE_KEY">
      <UserProvider>
        <FontSizeProvider> {/* Wrap with FontSizeProvider */}
        <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <CssBaseline />
          <Router>
            <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <Header />
            <Box
              sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                minHeight: '100vh',        // पूरी height cover करे
                width: '100%',             // पूरी width cover करे
                transition: 'background 0.3s, color 0.3s'
              }}
            >
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login1" element={<Login1 />} />
                <Route path="/login2" element={<Login2 />} />
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

<Route
  path="/sales"
  element={
    <ProtectedRoute isDepartmentDashboard={true}>
      <SalesDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/production"
  element={
    <ProtectedRoute isDepartmentDashboard={true}>
      <ProductionDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/hr"
  element={
    <ProtectedRoute isDepartmentDashboard={true}>
      <HRDashboard />
    </ProtectedRoute>
  }
/>


                {/* Senior Management Only */}
                <Route 
                  path="/upload" 
                  element={
                    <ProtectedRoute requiredRole="senior">
                      <UploadPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute requiredRole="senior">
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/edit/:filename" element={<EditCsvPage />} />
              </Routes>
            </Box>
          </Router>
        </MuiThemeProvider>
        </FontSizeProvider>
      </UserProvider>
    </GoogleReCaptchaProvider>    
  );
}
