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
  Chip
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
  const { user, logout, isAuthenticated, isSenior } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);

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
          {/* Dashboard Navigation */}
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

          {/* Production Dashboard */}
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

          {/* Sales Dashboard */}
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

          {/* HR Dashboard */}
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

          {/* Senior Management Only */}
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
    </AppBar>
  );
}
