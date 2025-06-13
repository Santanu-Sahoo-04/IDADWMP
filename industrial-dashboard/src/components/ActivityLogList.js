import React from 'react';
import {
  Paper, Typography, Box, Button, Chip, Divider, List, ListItem, ListItemText, CircularProgress
} from '@mui/material';
import { History as HistoryIcon, Visibility as ViewIcon } from '@mui/icons-material';

// This component is purely for rendering the list of activity logs
const ActivityLogList = ({ logEntries, handleView, logLoading, isCMD, isDirector, user }) => {
  if (logEntries.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          File Activity Log
          {logLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="textSecondary">No recent file activities.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        File Activity Log
        {logLoading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {logEntries.map((log) => (
          <ListItem key={log.log_id} divider>
            <ListItemText
              primary={
                <Typography variant="body1">
                  <Chip label={log.action_type.toUpperCase()} size="small" color="info" sx={{ mr: 1 }} />
                  File: <strong>{log.file_original_name || log.details?.original_name || 'N/A'}</strong> (Dept: {log.target_department_name})
                </Typography>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    By: {log.action_by_name} ({log.action_by_designation}, {log.action_by_department_name}) at {new Date(log.action_date).toLocaleString()}
                  </Typography>
                  {(log.action_type === 'edit_request' || log.action_type === 'edit_request_overwrite_pending') && (
                    <Chip
                      label={`File Approval Status: ${log.file_approval_status || 'N/A'}`}
                      size="small"
                      color={log.file_approval_status === 'pending' ? 'warning' : (log.file_approval_status === 'approved' ? 'success' : 'error')}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                  {(log.action_type === 'accept_edit' || log.action_type === 'reject_edit') && log.approval_action_by_name && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      {log.action_type === 'accept_edit' ? 'Accepted' : 'Rejected'} by {log.approval_action_by_name} at {new Date(log.approval_action_date).toLocaleString()}
                      {log.notes && ` (Notes: ${log.notes})`}
                    </Typography>
                  )}
                  {/* View links for edit requests visible based on role */}
                  {((isCMD || isDirector || (user && log.action_by === user.id)) &&
                   (log.action_type === 'edit_request' || log.action_type === 'edit_request_overwrite_pending')) && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleView(`/api/upload/file-content/${log.pending_file_id}`)}
                        sx={{ mr: 1 }}
                      >
                        View Pending
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleView(`/api/upload/file-content/${log.file_id}`)}
                        sx={{ mr: 1 }}
                      >
                        View Original
                      </Button>
                    </Box>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ActivityLogList;