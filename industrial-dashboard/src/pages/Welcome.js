import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <header className="welcome-header">
        <img src="/company-logo.png" alt="Company Logo" className="company-logo" />
        <div className="project-title">INDUSTRIAL ANALYTICS</div>
      </header>
      <div className="welcome-body">
        <div className="welcome-desc">
          This portal empowers NALCO with secure, role-based analytics for Sales, HR, and Production.
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
      </div>
    </div>
  );
}
