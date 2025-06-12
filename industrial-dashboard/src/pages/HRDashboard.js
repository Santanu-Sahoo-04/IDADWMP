// src/pages/HRDashboard.js
import React from 'react';

export default function HRDashboard() {
  return (
    <div>
      <h1>HR Dashboard</h1>
      {/* Box container */}
      <div style={{
        padding: '16px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: '16px 0'
      }}>
        {/* Tableau dashboard, fitting inside the box */}
        <tableau-viz
          src="https://public.tableau.com/views/HR_17486901578370/HRANALYTICSDASHBOARD?:language=en-GB&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link"
          toolbar="bottom"
          hide-tabs
          style={{
            width: '100%',
            height: '755px',
            border: 'none', // Remove border from tableau-viz to avoid double borders
            borderRadius: '4px',
            display: 'block'
          }}
        ></tableau-viz>
      </div>
    </div>
  );
}
