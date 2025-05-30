import React, { useState } from 'react';
import { Button, Container, Typography, Select, MenuItem } from '@mui/material';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('sales');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Upload functionality will be connected to backend!');
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h5" gutterBottom>Upload Data (Admin Only)</Typography>
      <form onSubmit={handleSubmit}>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px' }}
        >
          <MenuItem value="sales">Sales</MenuItem>
          <MenuItem value="hr">HR</MenuItem>
          <MenuItem value="production">Production</MenuItem>
        </Select>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '20px', display: 'block' }}
        />
        <Button type="submit" variant="contained" color="primary">
          Upload
        </Button>
      </form>
    </Container>
  );
}
