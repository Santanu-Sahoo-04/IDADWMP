/*
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { mockHR } from '../mockData.js';

export default function HRDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>HR Report</h1>
      <BarChart width={600} height={400} data={mockHR}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="employee" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="salary" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}
*/

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button, Typography } from '@mui/material';
import { mockHR } from '../mockData';

export default function HRDashboard() {
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  const isGM = role === 'GM';

  let allowedDept = null;
  if (isGM && email) {
    const deptCode = email.split('@')[0].slice(-1);
    allowedDept = { '1': 'production', '2': 'sales', '3': 'hr' }[deptCode];
  }

  const canEdit = !isGM || allowedDept === 'hr';

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">HR Report</Typography>
      <BarChart width={600} height={400} data={mockHR}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="employee" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="salary" fill="#82ca9d" />
      </BarChart>
      {canEdit && (
        <div style={{ marginTop: 24 }}>
          <Button variant="contained" color="primary" style={{ marginRight: 8 }}>Upload Data</Button>
          <Button variant="contained" color="secondary">AI Analysis</Button>
        </div>
      )}
    </div>
  );
}
