// src/components/SplashScreen.js
import React from 'react';
import './SplashScreen.css';
import nalcoImg from '../../assets/images/NALCO.png';
import nalcoLogoImg from '../../assets/images/NALCOLOGO.png';
export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src={nalcoImg} alt="NALCO Logo" className="splash-logo" />
        <div className="splash-title-row">
          <span className="splash-hindi">नालको</span>
          <img src={nalcoLogoImg} alt="NALCO" style={{height: '40px', margin: '0 12px'}} />
          <span className="splash-english">NALCO</span>
        </div>
        <div className="splash-tagline">
          Largest Integrated Bauxite-Alumina-Aluminium Complex in Asia
        </div>
      </div>
    </div>
  );
}
