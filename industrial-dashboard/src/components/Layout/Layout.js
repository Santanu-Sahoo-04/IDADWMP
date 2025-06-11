import React from 'react';
import TopBar from '../TopBar/TopBar';

export default function Layout({ children }) {
  return (
    <div className="app-container">
      <TopBar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
