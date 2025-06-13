import React from 'react';
import {
  Paper, Typography, Box, Button, Chip, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { Edit as EditIcon, CheckCircle as AcceptIcon, Cancel as RejectIcon, Visibility as ViewIcon } from '@mui/icons-material';

// This component is purely for rendering the list of pending files
const PendingFilesList = ({ displayPendingEditFiles, handleView, handleDirectorAction, isCMD, isDirector, user }) => {
  // Only render the entire Paper section if there are pending files AND the user is CMD or a Director.
  // The filtering for which specific files appear is done in UploadPage.js (displayPendingEditFiles).
  if (displayPendingEditFiles.length === 0) {
    return null; // Return null if no files to display
  }

  // Check if the current user is a CMD or Director to show this section
  // This top-level check ensures the whole box only appears for authorized roles.
  // The list 'displayPendingEditFiles' is already filtered in UploadPage.js for relevant files.
  if (!isCMD && !isDirector) {
      return null; // Don't render the section if not CMD or Director
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'warning.light' }}>
      <Typography variant="h6" gutterBottom color="warning.dark">
        <EditIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Pending File Edits (Action Required)
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {displayPendingEditFiles.map((file) => (
          <ListItem key={file.upload_id} divider>
            <ListItemText
              primary={`Pending Edit: ${file.original_name} (Submitted by: ${file.uploader_name || 'N/A'})`}
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Submitted on: {new Date(file.upload_date).toLocaleString()} | Dept: {file.department_name}
                  </Typography>
                  <Chip label="Status: Pending Approval" size="small" color="warning" sx={{ mt: 0.5 }} />
                </Box>
              }
            />
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ViewIcon />}
                onClick={() => handleView(file.viewUrl)} // This will be /uploads/filename
                sx={{ mr: 1 }}
              >
                View Pending
              </Button>
              {file.parent_file_id && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => handleView(`/api/upload/file-content/${file.parent_file_id}`)} // New endpoint for original content
                  sx={{ mr: 1 }}
                >
                  View Original
                </Button>
              )}
              {/* Accept/Reject buttons - only for relevant Directors/CMD */}
              {(isCMD || (isDirector && file.department_id === user?.departmentId)) && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    startIcon={<AcceptIcon />}
                    onClick={() => handleDirectorAction(file.parent_file_id, 'accept')} // Action targets parent file
                    sx={{ mr: 1 }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleDirectorAction(file.parent_file_id, 'reject')} // Action targets parent file
                  >
                    Reject
                  </Button>
                </>
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default PendingFilesList;