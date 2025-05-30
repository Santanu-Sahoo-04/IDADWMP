/*

import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Industrial Analytics</Typography>
        <Button color="inherit" component={Link} to="/sales">Sales</Button>
        <Button color="inherit" component={Link} to="/hr">HR</Button>
        <Button color="inherit" component={Link} to="/production">Production</Button>
        {(role === 'CMD' || role === 'Director' || role === 'ED' || role === 'GGM' || role === 'GM') && (
          <Button color="inherit" component={Link} to="/upload">Upload</Button>
        )}
        {role && (
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

*/

import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  //const role = localStorage.getItem('role');
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Only show navigation buttons if NOT on welcome or login pages
  const hideNav = ["/", "/login1", "/login2"].includes(location.pathname);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <img src="/company-logo.png" alt="COMPANY LOGO" style={{ height: 40, marginRight: 16 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          INDUSTRIAL ANALYTICS
        </Typography>
        {!hideNav && (
          <>
            <Button color="inherit" component={Link} to="/sales">SALES</Button>
            <Button color="inherit" component={Link} to="/hr">HR</Button>
            <Button color="inherit" component={Link} to="/production">PRODUCTION</Button>
            <Button color="inherit" onClick={handleLogout}>LOGOUT</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
