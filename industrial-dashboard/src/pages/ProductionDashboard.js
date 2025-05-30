/*
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { mockProduction } from '../mockData.js';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ProductionDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Production Report</h1>
      <PieChart width={400} height={400}>
        <Pie
          data={mockProduction}
          dataKey="units"
          nameKey="product"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label
        >
          {mockProduction.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
*/

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Button, Typography } from '@mui/material';
import { mockProduction } from '../mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ProductionDashboard() {
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  const isGM = role === 'GM';

  let allowedDept = null;
  if (isGM && email) {
    const deptCode = email.split('@')[0].slice(-1);
    allowedDept = { '1': 'production', '2': 'sales', '3': 'hr' }[deptCode];
  }

  const canEdit = !isGM || allowedDept === 'production';

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">Production Report</Typography>
      <PieChart width={400} height={400}>
        <Pie
          data={mockProduction}
          dataKey="units"
          nameKey="product"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label
        >
          {mockProduction.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      {canEdit && (
        <div style={{ marginTop: 24 }}>
          <Button variant="contained" color="primary" style={{ marginRight: 8 }}>Upload Data</Button>
          <Button variant="contained" color="secondary">AI Analysis</Button>
        </div>
      )}
    </div>
  );
}
