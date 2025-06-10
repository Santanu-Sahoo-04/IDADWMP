/*
import TableauDashboard from '../components/TableauDashboard';

export default function HRDashboard() {
  return <TableauDashboard department="hr" title="HR Dashboard" />;
}
*/

// src/pages/HRDashboard.js
import React from 'react';

export default function HRDashboard() {
  return (
    <div>
      <h1>HR Dashboard</h1>
      {/* Paste the tableau-viz tag here */}
      
      <tableau-viz
        src="https://public.tableau.com/views/HR_17486901578370/HRANALYTICSDASHBOARD?:language=en-GB&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link"
        toolbar="bottom"
        hide-tabs
        style={{ width: '100%', height: '700px', border: '1px solid #ccc', borderRadius: 4 }}
      ></tableau-viz>
    </div>
  );
}
