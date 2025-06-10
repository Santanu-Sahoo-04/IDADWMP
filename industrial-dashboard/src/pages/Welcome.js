import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';
import productionImg from '../assets/images/Production.jpeg';
import salesImg from '../assets/images/Sales.jpeg';
import HRImg from '../assets/images/HR.jpg';
import nalcoImg from '../assets/images/NALCO.png';
import Spotlight from '../components/spotlight/Spotlight.js';
import NALCOMap from '../components/Maps/NALCOMap.js';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
        <Spotlight />

      <header className="welcome-header">
        <img src={nalcoImg} alt="Company Logo" className="company-logo" />
        <div className="project-title">INDUSTRIAL ANALYTICS</div>
        <div className="project-subtitle">Empowering Data-Driven Decisions</div>

      </header>
      <div className="welcome-body">
        <div className="welcome-desc">
          This portal empowers NALCO with secure, role-based analytics for Sales, HR, and Production.
          {/* This portal empowers NALCO with secure, role-based analytics for Sales, HR, and Production departments with real-time insights and interactive dashboards. */}
        </div>
        <button
          className="login-btn senior"
          onClick={() => navigate('/login1')}
        >
          Senior Management Login
        </button>
        <button
          className="login-btn junior"
          onClick={() => navigate('/login2')}
        >
          Junior Management Login
        </button>
        <div className="password-rules">
        Password must be at least 8 characters, include letters and numbers/symbols, and have no spaces.
        </div>

        <div className="photo-holder-section">
        <div className="photo-holder">
          {/* You can replace src with your uploaded image path */}
          <img src={productionImg} alt="Production" />
        <div className="photo-label">Production</div>
        </div>
        <div className="photo-holder">
          <img src={salesImg} alt="Sales" />
          <div className="photo-label">Sales</div>
        </div>
        <div className="photo-holder">
          <img src={HRImg} alt="HR" />
          <div className="photo-label">HR</div>
        </div>
      </div>
      </div>
      
    </div>
  );
}
