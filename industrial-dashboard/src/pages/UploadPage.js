import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import Papa from 'papaparse';

export default function UploadPage() {
  const { isSenior } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/upload/history', {
        credentials: 'include'
      });
      if (res.ok) {
        const history = await res.json();
        setUploadHistory(history);
      }
    } catch (err) {
      console.error('Failed to fetch upload history:', err);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      setUploadResult({
        success: false,
        message: 'Please select a valid CSV file'
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const res = await fetch('http://localhost:5000/api/upload/csv', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await res.json();
      setUploadResult(result);
      
      if (result.success) {
        setSelectedFile(null);
        fetchUploadHistory();
      }
    } catch (err) {
      setUploadResult({
        success: false,
        message: 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  if (!isSenior) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Access denied. This page is only available to senior management.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Data Upload Center
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload SAP Data (CSV)
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Upload CSV files exported from SAP to update dashboard data.
                    Supported formats: Production, Sales, and HR data.
                  </Typography>
                </Alert>
              </Box>

              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  mb: 2,
                  backgroundColor: selectedFile ? '#f5f5f5' : 'transparent'
                }}
              >
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="csv-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    size="large"
                  >
                    Select CSV File
                  </Button>
                </label>
                
                {selectedFile && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Selected: {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Size: {(selectedFile.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                )}
              </Box>

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                fullWidth
                size="large"
                startIcon={<CloudUpload />}
              >
                {uploading ? 'Uploading...' : 'Upload Data'}
              </Button>

              {uploading && <LinearProgress sx={{ mt: 2 }} />}

              {uploadResult && (
                <Alert 
                  severity={uploadResult.success ? 'success' : 'error'} 
                  sx={{ mt: 2 }}
                >
                  {uploadResult.message}
                  {uploadResult.recordsProcessed && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Records processed: {uploadResult.recordsProcessed}
                    </Typography>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upload History */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Uploads
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {uploadHistory.length === 0 ? (
                <Typography color="textSecondary" textAlign="center">
                  No uploads yet
                </Typography>
              ) : (
                <List>
                  {uploadHistory.map((upload, index) => (
                    <ListItem key={index} divider={index < uploadHistory.length - 1}>
                      <ListItemIcon>
                        {upload.status === 'success' ? 
                          <CheckCircle color="success" /> : 
                          <Error color="error" />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={upload.filename}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {new Date(upload.upload_date).toLocaleString()}
                            </Typography>
                            <Chip
                              label={upload.status}
                              size="small"
                              color={upload.status === 'success' ? 'success' : 'error'}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        href={`http://localhost:5000/uploads/${encodeURIComponent(upload.filename)}`}
                        target="_blank"
                        sx={{ ml: 2 }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this file?')) {
                            const res = await fetch(
                              `http://localhost:5000/api/upload/file/${encodeURIComponent(upload.filename)}`,
                              { method: 'DELETE', credentials: 'include' }
                            );
                            if (res.ok) fetchUploadHistory();
                          }
                        }}
                        sx={{ ml: 1 }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => window.open(`/edit/${upload.filename}`, '_blank')}
                        sx={{ ml: 1 }}
                      >
                        Edit
                      </Button>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Upload Instructions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Production Data
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    CSV should contain: Date, Product, Quantity, Quality Metrics, 
                    Equipment Status, Energy Consumption
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sales Data
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    CSV should contain: Date, Customer, Product, Revenue, 
                    Region, Sales Rep, Order Status
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>
                    HR Data
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    CSV should contain: Employee ID, Department, Attendance, 
                    Performance, Training Status, Leave Balance
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
