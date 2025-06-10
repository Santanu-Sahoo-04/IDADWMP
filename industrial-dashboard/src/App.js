import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from '@google-recaptcha/react';
import { UserProvider } from './context/UserContext';

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
import EditCsvPage from './pages/EditCsvPage'; // Create this component

export default function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="YOUR_SITE_KEY">
      <UserProvider>
        <Router>
          <Header />
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
                <ProtectedRoute>
                  <SalesDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/production" 
              element={
                <ProtectedRoute>
                  <ProductionDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hr" 
              element={
                <ProtectedRoute>
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

            <Route path="/edit/:filename" element={<EditCsvPage />} />

          </Routes>
        </Router>
      </UserProvider>
    </GoogleReCaptchaProvider>
  );
}
