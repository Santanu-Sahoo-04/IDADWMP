import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from '@google-recaptcha/react';

import Header from './components/Header';
import Welcome from './pages/Welcome';
import Login1 from './pages/Login1';
import Login2 from './pages/Login2';
import SalesDashboard from './pages/SalesDashboard';
import ProductionDashboard from './pages/ProductionDashboard';
import HRDashboard from './pages/HRDashboard';
import UploadPage from './pages/UploadPage';

export default function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="YOUR_SITE_KEY">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login1" element={<Login1 />} />
          <Route path="/login2" element={<Login2 />} />
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/production" element={<ProductionDashboard />} />
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </Router>
    </GoogleReCaptchaProvider>
  );
}
