import React from 'react';
import TableauVizComponent from '../../src/components/TableauViz';

export default function SeniorDashboard() {
  return (
    <div>
      <h2>Senior Management Tableau Dashboard</h2>
      <TableauVizComponent
        src="https://public.tableau.com/views/WorldIndicators/GDPpercapita"
      />
    </div>
  );
}
