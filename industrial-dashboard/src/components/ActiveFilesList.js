import React from 'react';
import {
  Paper, Typography, Box, Button, Chip, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';

// This component is purely for rendering the list of active files
const ActiveFilesList = ({ displayActiveFiles, handleView, handleEdit, handleDelete }) => {
  if (displayActiveFiles.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <EditIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Active Files
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="textSecondary">No active files found for your department.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        <EditIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Active Files
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {displayActiveFiles.map((file) => (
          <ListItem key={file.upload_id} divider>
            <ListItemText
              primary={`${file.original_name} (Uploaded by: ${file.uploader_name || 'N/A'})`}
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Uploaded on: {new Date(file.upload_date).toLocaleString()} | Dept: {file.department_name}
                  </Typography>
                  <Chip label={`Status: ${file.status}`} size="small" color="success" sx={{ mr: 1, mt: 0.5 }} />
                </Box>
              }
            />
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => handleView(file.filename)}
                sx={{ mr: 1 }}
              >
                View
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleEdit(file.filename)}
                sx={{ mr: 1 }}
                disabled={
                  file.has_pending_edit ||
                  file.original_name.split('.').pop().toLowerCase() !== 'csv'
                }
              >
                Edit (CSV Only)
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(file.filename, file.upload_id)}
                disabled={file.has_pending_edit}
              >
                Delete
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ActiveFilesList;