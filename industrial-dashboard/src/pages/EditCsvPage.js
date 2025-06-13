import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Papa from 'papaparse';
import { Button, Typography, Container, Box, CircularProgress, Alert, Paper, TextField } from '@mui/material';
import { useUser } from '../context/UserContext';

export default function EditCsvPage() {
  const { filename } = useParams(); // This 'filename' is the original active file's filename on disk
  const { isSenior, loading: userContextLoading } = useUser();
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true); // For file content loading
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Wait for the UserContext to finish loading before performing authorization checks
    if (userContextLoading) {
      return; // Do nothing while user context is still loading
    }

    // Now, perform the authorization check
    if (!isSenior) {
      setError('Access Denied. This page is for Senior Management only.');
      setLoading(false); // Stop file content loading, show error
      // Optional: you can close the window after a delay if unauthorized
      // setTimeout(() => window.close(), 2000);
      return;
    }

    // If authenticated and senior, then fetch the file content
    fetchCsvData();
  }, [filename, isSenior, userContextLoading]);

  const fetchCsvData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the file content from the uploads directory
      const res = await fetch(`http://localhost:5000/uploads/${encodeURIComponent(filename)}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch file content: ${res.statusText || res.status}`);
      }
      const text = await res.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (parsed.errors.length > 0) {
        console.error("PapaParse errors:", parsed.errors);
        setError("Error parsing CSV file. Please ensure it's valid CSV.");
        setCsvData([]);
        return;
      }
      setCsvData(parsed.data);
    } catch (err) {
      console.error('Error loading CSV:', err);
      setError('Failed to load file content. Please ensure it is a valid CSV file. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('dataFile', blob, filename); // Use 'dataFile' as backend expects

      // Send the edited file to the backend's PUT route for pending edit submission
      const res = await fetch(
        `http://localhost:5000/api/upload/file/${encodeURIComponent(filename)}`,
        { method: 'PUT', body: formData, credentials: 'include' }
      );

      if (res.ok) {
        // If successful, signal the opener window to refresh its history/file list
        if (window.opener) {
          if (typeof window.opener.fetchFiles === 'function') {
            window.opener.fetchFiles();
          }
          if (typeof window.opener.fetchActivityLog === 'function') {
            window.opener.fetchActivityLog();
          }
        }
        window.close(); // Close the current editing window
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to save changes.');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError('Network error during save.');
    } finally {
      setSaving(false);
    }
  };

  // Render a loading spinner specifically for the user context check
  if (userContextLoading) {
    return (
      <Container sx={{ mt: 4 }}><CircularProgress /><Typography>Authenticating...</Typography></Container>
    );
  }

  // Once user context is loaded, then check for senior status
  if (!isSenior) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // If senior and file content is still loading
  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /><Typography>Loading file content...</Typography></Container>;

  // If senior and file content failed to load
  if (error) return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  // If senior and no data in CSV after loading
  if (csvData.length === 0 && !loading && !error) return <Container maxWidth="md" sx={{ mt: 4 }}><Alert severity="info">No data found in CSV or file is empty.</Alert></Container>;


  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Editing: {filename}</Typography>
        <Box>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
          <Button variant="outlined" onClick={() => window.close()}>
            Close
          </Button>
        </Box>
      </Box>

      <Paper sx={{ maxHeight: '70vh', overflow: 'auto' }} elevation={3}>
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
                      top: 0,
                      zIndex: 1,
                      textAlign: 'left'
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
                    <TextField
                      variant="outlined"
                      size="small"
                      value={row[col] || ''}
                      onChange={(e) => {
                        const newData = [...csvData];
                        newData[rowIndex][col] = e.target.value;
                        setCsvData(newData);
                      }}
                      fullWidth
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </Container>
  );
}