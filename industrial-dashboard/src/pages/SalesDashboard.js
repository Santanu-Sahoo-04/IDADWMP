/*
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { mockSales } from '../mockData.js';

export default function SalesDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Sales Report</h1>
      <LineChart width={800} height={400} data={mockSales}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}

*/
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Button, Typography } from '@mui/material';
import { mockSales } from '../mockData';

export default function SalesDashboard() {
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email');
  const isGM = role === 'GM';

  // For GM, extract allowed department from email (last digit: 1=production, 2=sales, 3=hr)
  let allowedDept = null;
  if (isGM && email) {
    const deptCode = email.split('@')[0].slice(-1);
    allowedDept = { '1': 'production', '2': 'sales', '3': 'hr' }[deptCode];
  }

  // Only show upload/AI if not GM, or if GM and allowedDept is 'sales'
  const canEdit = !isGM || allowedDept === 'sales';

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">Sales Report</Typography>
      <LineChart width={800} height={400} data={mockSales}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
      </LineChart>
      {canEdit && (
        <div style={{ marginTop: 24 }}>
          <Button variant="contained" color="primary" style={{ marginRight: 8 }}>Upload Data</Button>
          <Button variant="contained" color="secondary">AI Analysis</Button>
        </div>
      )}
    </div>
  );
}
