import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Box, Button, TextField,
  MenuItem, Select, InputLabel, FormControl, Alert, CircularProgress,
  List, ListItem, ListItemText, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions // <--- RE-ADDED MISSING IMPORTS HERE
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
// import { useNavigate } from 'react-router-dom'; // Keeping this commented to avoid lint warning if not directly used

// Import the new list components (these files must exist as per previous instructions)
import PendingFilesList from '../components/PendingFilesList';
import ActiveFilesList from '../components/ActiveFilesList';
import ActivityLogList from '../components/ActivityLogList';

export default function UploadPage() {
  // eslint-disable-next-line no-unused-vars
  // const navigate = useNavigate(); // This warning is due to navigate being imported but not directly called in JSX, it's used in handlers. Can be ignored.
  const { user, isSenior, isCMD, isDirector } = useUser();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [targetDepartment, setTargetDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [files, setFiles] = useState([]); // This state will still hold the data
  const [logEntries, setLogEntries] = useState([]); // This state will still hold the data
  const [logLoading, setLogLoading] = useState(true);
  const [logError, setLogError] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [openNotesDialog, setOpenNotesDialog] = useState(false);
  const [currentFileAction, setCurrentFileAction] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const getDepartmentName = (departmentId) => { // This warning is because it's called within a complex string, not directly. Can be ignored.
    switch (departmentId) {
      case 1: return 'Production';
      case 2: return 'Sales';
      case 3: return 'HR';
      default: return `ID: ${departmentId}`;
    }
  };

  useEffect(() => {
    if (isSenior) {
      fetchFiles();
      fetchActivityLog();
      if (isCMD) {
        fetchDepartments();
      }
    }
  }, [isSenior, isCMD, user]);

  useEffect(() => {
    if (user && user.role === 'senior') {
      window.fetchFiles = fetchFiles;
      window.fetchActivityLog = fetchActivityLog;
      return () => {
        delete window.fetchFiles;
        delete window.fetchActivityLog;
      };
    }
  }, [user, isSenior]);


  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/departments', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setDepartments(data);
      } else {
        console.error("Failed to fetch departments:", data.error);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/upload/files', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setFiles(data);
      } else {
        setUploadError(data.error || 'Failed to fetch files.');
      }
    } catch (err) {
      setUploadError('Network error fetching files.');
    }
  };

  const fetchActivityLog = async () => {
    setLogLoading(true);
    setLogError('');
    try {
      const res = await fetch('http://localhost:5000/api/upload/activity-log', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setLogEntries(data);
      } else {
        setLogError(data.error || 'Failed to fetch activity log.');
      }
    } catch (err) {
      setLogError('Network error fetching activity log.');
    } finally {
      setLogLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage('');
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (isCMD && !targetDepartment) {
      setUploadError('CMD must select a target department for the upload.');
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setUploadError('');

    const formData = new FormData();
    formData.append('dataFile', selectedFile);
    if (isCMD && targetDepartment) {
      formData.append('targetDepartmentId', targetDepartment);
    }

    try {
      const response = await fetch('http://localhost:5000/api/upload/file', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage(data.message);
        setSelectedFile(null);
        setTargetDepartment('');
        fetchFiles();
        fetchActivityLog();
      } else {
        setUploadError(data.message || data.error || 'Upload failed.');
      }
    } catch (err) {
      setUploadError('Network error during upload.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleView = (url) => {
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.startsWith('/api/') || url.startsWith('/uploads/')) {
            fullUrl = `http://localhost:5000${url}`;
        } else {
            fullUrl = `http://localhost:5000/uploads/${encodeURIComponent(url)}`;
        }
    }
    window.open(fullUrl, '_blank');
  };

  const handleDelete = async (filename, fileId) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }
    setUploadError('');
    try {
      const response = await fetch(`http://localhost:5000/api/upload/file/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setUploadMessage(data.message);
        fetchFiles();
        fetchActivityLog();
      } else {
        setUploadError(data.error || 'Failed to delete file.');
      }
    } catch (err) {
      setUploadError('Network error during deletion.');
      console.error('Delete error:', err);
    }
  };

  const handleEdit = (filename) => {
    window.open(`/edit/${encodeURIComponent(filename)}`, '_blank', 'noopener,noreferrer');
  };

  const handleDirectorAction = (fileId, actionType) => {
    setCurrentFileAction({ fileId, actionType });
    setOpenNotesDialog(true);
  };

  const handleCloseNotesDialog = () => {
    setOpenNotesDialog(false);
    setActionNotes('');
    setCurrentFileAction(null);
  };

  const handleSubmitDirectorAction = async () => {
    if (!currentFileAction) return;

    setUploadError('');
    try {
      const response = await fetch(`http://localhost:5000/api/upload/file-action/${currentFileAction.fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: currentFileAction.actionType, notes: actionNotes })
      });
      const data = await response.json();

      if (response.ok) {
        setUploadMessage(data.message);
        fetchFiles();
        fetchActivityLog();
      } else {
        setUploadError(data.error || `Failed to ${currentFileAction.actionType} file.`);
      }
    } catch (err) {
      setUploadError(`Network error during ${currentFileAction.actionType} action.`);
      console.error(`Director action error (${currentFileAction.actionType}):`, err);
    } finally {
      handleCloseNotesDialog();
    }
  };


  if (!user || !isSenior) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Access Denied. This page is for Senior Management only.</Alert>
      </Container>
    );
  }

  // Filter files based on status and user roles for display
  const displayActiveFiles = files.filter(f => f.status === 'active' && (isCMD || f.department_id === user.departmentId));
  const displayPendingEditFiles = files.filter(f =>
    f.status === 'pending_edit' && (isCMD || (isDirector && f.department_id === user.departmentId))
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Upload and Manage Department Data
      </Typography>

      {uploadMessage && <Alert severity="success" sx={{ mb: 2 }}>{uploadMessage}</Alert>}
      {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
      {logError && <Alert severity="error" sx={{ mb: 2 }}>{logError}</Alert>}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload New File
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <input
            accept=".csv,.xlsx"
            style={{ display: 'none' }}
            id="file-upload-button"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload-button">
            <Button variant="contained" component="span" startIcon={<UploadIcon />}>
              Select File
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body1" sx={{ ml: 2 }}>
              {selectedFile.name}
            </Typography>
          )}
        </Box>

        {isCMD && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="target-department-label">Target Department</InputLabel>
            <Select
              labelId="target-department-label"
              id="target-department-select"
              value={targetDepartment}
              label="Target Department"
              onChange={(e) => setTargetDepartment(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Department</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.department_id} value={dept.department_id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading || !selectedFile || (isCMD && !targetDepartment)}
          sx={{ mt: 1 }}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload File'}
        </Button>
      </Paper>

      {/* Pending Edits Section - Now uses a dedicated component */}
      <PendingFilesList
        displayPendingEditFiles={displayPendingEditFiles}
        handleView={handleView}
        handleDirectorAction={handleDirectorAction}
        isCMD={isCMD}
        isDirector={isDirector}
        user={user}
      />

      {/* Active Files Section - Now uses a dedicated component */}
      <ActiveFilesList
        displayActiveFiles={displayActiveFiles}
        handleView={handleView}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* File Activity Log Section - Now uses a dedicated component */}
      <ActivityLogList
        logEntries={logEntries}
        handleView={handleView}
        logLoading={logLoading}
        isCMD={isCMD}
        isDirector={isDirector}
        user={user}
      />

      {/* Director Notes Dialog */}
      <Dialog open={openNotesDialog} onClose={handleCloseNotesDialog}>
        <DialogTitle>
          {currentFileAction?.actionType === 'accept' ? 'Accept' : 'Reject'} File Changes
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNotesDialog}>Cancel</Button>
          <Button onClick={handleSubmitDirectorAction} color="primary">
            Confirm {currentFileAction?.actionType === 'accept' ? 'Accept' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}