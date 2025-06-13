import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Chip,
  Alert // Import Alert for displaying messages
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Upload,
  People,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isSenior, isJunior } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null); // State for alert

  const handleUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getDepartmentName = (departmentId) => {
    switch (departmentId) {
      case 1: return 'Production';
      case 2: return 'Sales';
      case 3: return 'HR';
      default: return '';
    }
  };

  const getDepartmentPath = (departmentName) => {
    return `/${departmentName.toLowerCase()}`;
  };

  const handleDepartmentDashboardClick = (departmentPath) => {
    // This check is ONLY for Juniors
    if (isJunior && !user.dashboardAccessEnabled) {
      setAlertMessage("CONTACT THE SENIOR: You do not have access to the department dashboard.");
      setTimeout(() => setAlertMessage(null), 5000);
    } else {
      navigate(departmentPath);
    }
  };

  if (!isAuthenticated) {
    return (
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Industrial Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/login1')}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  const userDepartmentName = user ? getDepartmentName(user.departmentId) : '';
  const userDepartmentPath = user ? getDepartmentPath(userDepartmentName) : '';

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          Industrial Dashboard
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
          {/* Dashboard Navigation (Account Details) - Always visible if authenticated */}
          <Button
            color="inherit"
            startIcon={<Dashboard />}
            onClick={() => navigate('/dashboard')}
            sx={{
              mr: 1,
              backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Dashboard
          </Button>

          {/* Department Dashboards */}
          {/* If Senior, show all three department dashboards */}
          {isSenior && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/production')}
                sx={{
                  mr: 1,
                  backgroundColor: isActive('/production') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                Production
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/sales')}
                sx={{
                  mr: 1,
                  backgroundColor: isActive('/sales') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                Sales
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/hr')}
                sx={{
                  mr: 1,
                  backgroundColor: isActive('/hr') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                HR
              </Button>
            </>
          )}

          {/* If Junior, show ONLY their specific department dashboard and apply the access check */}
          {isJunior && userDepartmentName && (
            <Button
              color="inherit"
              onClick={() => handleDepartmentDashboardClick(userDepartmentPath)}
              sx={{
                mr: 1,
                backgroundColor: isActive(userDepartmentPath) ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              {userDepartmentName}
            </Button>
          )}

          {/* Senior Management Specific Buttons (Upload Data, Users) */}
          {isSenior && (
            <>
              <Button
                color="inherit"
                startIcon={<Upload />}
                onClick={() => navigate('/upload')}
                sx={{
                  mr: 1,
                  backgroundColor: isActive('/upload') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                Upload Data
              </Button>

              <Button
                color="inherit"
                startIcon={<People />}
                onClick={() => navigate('/user-management')}
                sx={{
                  mr: 1,
                  backgroundColor: isActive('/user-management') ? 'rgba(255,255,255,0.1)' : 'transparent'
                }}
              >
                Users
              </Button>
            </>
          )}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            label={isSenior ? 'Senior' : 'Junior'}
            size="small"
            color={isSenior ? 'secondary' : 'default'}
            sx={{ mr: 2 }}
          />

          <IconButton
            size="large"
            onClick={handleUserMenu}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseUserMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/dashboard'); handleCloseUserMenu(); }}>
              <AccountCircle sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      {alertMessage && (
        <Alert severity="error" sx={{ width: '100%', borderRadius: 0 }}>
          {alertMessage}
        </Alert>
      )}
    </AppBar>
  );
}