import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { Button, Typography, Container, Box } from '@mui/material';

export default function EditCsvPage() {
  const { filename } = useParams();
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCsvData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/uploads/${encodeURIComponent(filename)}`);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true });
        setCsvData(parsed.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading CSV:', err);
        setLoading(false);
      }
    };
    
    fetchCsvData();
  }, [filename]);

  const handleSave = async () => {
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('csvFile', blob, filename);

    try {
      const res = await fetch(
        `http://localhost:5000/api/upload/file/${encodeURIComponent(filename)}`,
        { method: 'PUT', body: formData, credentials: 'include' }
      );
      if (res.ok) {
        window.opener?.fetchUploadHistory?.();
        window.close();
      }
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  if (loading) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Editing: {filename}</Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }}>
            Save Changes
          </Button>
          <Button variant="outlined" onClick={() => window.close()}>
            Close
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {csvData[0] &&
                Object.keys(csvData[0]).map((col) => (
                  <th 
                    key={col} 
                    style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px', 
                      background: '#f5f5f5',
                      position: 'sticky',
                      top: 0
                    }}
                  >
                    {col}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.keys(row).map((col) => (
                  <td key={col} style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input
                      type="text"
                      value={row[col]}
                      onChange={(e) => {
                        const newData = [...csvData];
                        newData[rowIndex][col] = e.target.value;
                        setCsvData(newData);
                      }}
                      style={{ width: '100%' }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Container>
  );
}
