// src/pages/ProductionDashboard.js
import React from 'react';

export default function ProductionDashboard() {
  return (
    <div>
      <h1>Production Dashboard</h1>
      {/* Paste the tableau-viz tag here */}
      <tableau-viz
        src="https://public.tableau.com/views/HR_17486901578370/HRANALYTICSDASHBOARD?:language=en-GB&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link"
        toolbar="bottom"
        hide-tabs
        style={{ width: '100%', height: '800px', border: '1px solid #ccc', borderRadius: 4 }}
      ></tableau-viz>
    </div>
  );
}
