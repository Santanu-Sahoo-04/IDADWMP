import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Box,
  Chip,
  Card,
  CardContent,
  Divider,
  Button,
  Alert // Import Alert for displaying messages
} from '@mui/material';
import {
  Person,
  Business,
  LocationOn,
  Badge,
  Logout,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation

export default function UserDashboard() {
  const { user, logout } = useUser();
  const [userDetails, setUserDetails] = useState(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState(null); // State for access denied message
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation

  useEffect(() => {
    fetchUserDetails();

    // Check if redirected with denied access state from ProtectedRoute
    if (location.state?.dashboardAccessDenied) {
      setAccessDeniedMessage(
        location.state.message || "CONTACT THE SENIOR: You do not have access to the department dashboard."
      );
      // Clear the state after displaying to prevent it from showing on subsequent visits
      // without a redirect
      window.history.replaceState({}, document.title);
    }
  }, [location.state]); // Depend on location.state

  const fetchUserDetails = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/profile', {
        credentials: 'include'
      });
      if (res.ok) {
        const details = await res.json();
        setUserDetails(details);
      } else {
        console.error('Failed to fetch user details:', res.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // The Header component now handles conditional rendering of dashboard buttons,
  // so this getDashboardAccess is mostly for displaying what a user *can* access here.
  // This part of the UI may become redundant or need re-thinking if header is the primary navigation.
  const getDashboardAccess = () => {
    if (!user) return [];
    const dashboards = [];
    if (user.role === 'senior') {
      dashboards.push('Production', 'Sales', 'HR', 'Upload Data', 'User Management');
    } else if (user.role === 'junior') {
      // Junior always sees their main dashboard access
      dashboards.push('Account Details'); // Representing the general '/dashboard' route
      // If access to their specific department dashboard is enabled, show it
      if (user.dashboardAccessEnabled) {
          switch (user.departmentId) {
              case 1: dashboards.push('Production (Department)'); break;
              case 2: dashboards.push('Sales (Department)'); break;
              case 3: dashboards.push('HR (Department)'); break;
              default: break;
          }
      } else {
          // You might want to indicate they *could* have it but it's disabled
          let deptName = '';
          switch (user.departmentId) {
              case 1: deptName = 'Production'; break;
              case 2: deptName = 'Sales'; break;
              case 3: deptName = 'HR'; break;
              default: break;
          }
          if (deptName) {
              dashboards.push(`${deptName} (Department - Disabled)`);
          }
      }
    }
    return dashboards;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: user?.role === 'senior' ? 'primary.main' : 'secondary.main'
                }}
              >
                <Person sx={{ fontSize: 50 }} />
              </Avatar>

              <Typography variant="h5" gutterBottom>
                {userDetails?.name || user?.email}
              </Typography>

              <Chip
                label={user?.role === 'senior' ? 'Senior Management' : 'Junior Management'}
                color={user?.role === 'senior' ? 'primary' : 'secondary'}
                sx={{ mb: 2 }}
              />

              <Typography color="textSecondary" gutterBottom>
                {userDetails?.designation}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Person sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {userDetails?.name || 'Not Available'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Badge sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Employee ID
                      </Typography>
                      <Typography variant="body1">
                        {userDetails?.user_id || user?.id}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Business sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Department
                      </Typography>
                      <Typography variant="body1">
                        {userDetails?.department_name || 'Not Available'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {userDetails?.area || 'Not Available'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Access */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Dashboard Access
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {accessDeniedMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {accessDeniedMessage}
                </Alert>
              )}

              <Grid container spacing={2}>
                {getDashboardAccess().map((access, index) => (
                  <Grid item key={index}>
                    <Chip
                      label={access}
                      variant="outlined"
                      color={access.includes('Disabled') ? 'error' : 'primary'} // Visual cue for disabled
                      sx={{ m: 0.5 }}
                    />
                  </Grid>
                ))}
              </Grid>

              {user?.role === 'senior' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    As senior management, you have access to data upload and user management features.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}