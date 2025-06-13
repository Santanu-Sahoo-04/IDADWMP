import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, List, ListItem, ListItemText, Switch, Box, CircularProgress, Alert } from '@mui/material';
import { useUser } from '../context/UserContext';

export default function UserManagementPage() {
  const { user, isAuthenticated, isSenior } = useUser();
  const [juniors, setJuniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({}); // To manage individual switch loading states

  useEffect(() => {
    if (isAuthenticated && isSenior) {
      fetchJuniors();
    } else if (!isAuthenticated) {
      // Handle not authenticated (e.g., redirect or show login prompt)
    } else if (!isSenior) {
      setError('Access denied. This page is for senior management only.');
    }
  }, [isAuthenticated, isSenior]);

  const fetchJuniors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/user/juniors-for-senior', {
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch junior users');
      }
      setJuniors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (juniorId, currentStatus) => {
    // Optimistic UI update: Immediately change the local state for visual responsiveness
    setJuniors(prevJuniors =>
      prevJuniors.map(junior =>
        junior.user_id === juniorId
          ? { ...junior, dashboard_access_enabled: !currentStatus }
          : junior
      )
    );

    setUpdateStatus(prev => ({ ...prev, [juniorId]: true })); // Set loading state for this specific switch

    try {
      const response = await fetch('http://localhost:5000/api/user/toggle-dashboard-access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ juniorUserId: juniorId, isEnabled: !currentStatus }), // Send the NEW status
      });
      const data = await response.json();

      if (!response.ok) {
        // If API call fails, revert the optimistic UI update
        setJuniors(prevJuniors =>
          prevJuniors.map(junior =>
            junior.user_id === juniorId
              ? { ...junior, dashboard_access_enabled: currentStatus } // Revert to original status
              : junior
          )
        );
        throw new Error(data.error || 'Failed to update access');
      }

      // If the backend has complex cascading effects, you might re-enable fetchJuniors() here.
      // Otherwise, the optimistic update is often sufficient.
      // fetchJuniors();

    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateStatus(prev => ({ ...prev, [juniorId]: false })); // Reset loading state
    }
  };

  // Helper to get department name - ADD THIS HELPER FUNCTION
  const getDepartmentName = (departmentId) => {
    switch (departmentId) {
      case 1: return 'Production';
      case 2: return 'Sales';
      case 3: return 'HR';
      default: return `ID: ${departmentId}`; // Fallback for unknown IDs
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Junior Access
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <List>
          {juniors.length === 0 ? (
            <Typography>No junior members found in your department.</Typography>
          ) : (
            juniors.map((junior) => (
              <ListItem key={junior.user_id} divider>
                <ListItemText
                  primary={`${junior.name} (${junior.email})`}
                  // MODIFIED: Include department name in secondary text
                  secondary={`${junior.designation} - Dept: ${getDepartmentName(junior.department_id)}`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ mr: 1 }}>
                    {junior.dashboard_access_enabled ? 'Enabled' : 'Disabled'}
                  </Typography>
                  <Switch
                    checked={junior.dashboard_access_enabled}
                    onChange={() => handleToggleAccess(junior.user_id, junior.dashboard_access_enabled)}
                    disabled={updateStatus[junior.user_id]}
                  />
                  {updateStatus[junior.user_id] && <CircularProgress size={20} sx={{ ml: 1 }} />}
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Container>
  );
}