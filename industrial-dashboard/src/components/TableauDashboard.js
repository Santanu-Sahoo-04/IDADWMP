import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';

// Replace these URLs with your actual Tableau Public URLs
const tableauUrls = {
  production: 'https://public.tableau.com/views/HR_17486901578370/HRANALYTICSDASHBOARD?:language=en-GB&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_linkYOUR_PRODUCTION_DASHBOARD_URL',
  sales: 'https://public.tableau.com/views/HR_17486901578370/HRANALYTICSDASHBOARD?:language=en-GB&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link',
  hr: 'https://public.tableau.com/views/HR_17486901578370/HRANALYTICSDASHBOARD?:language=en-GB&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link'
};

export default function TableauDashboard({ department, title }) {
  const vizRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [viz, setViz] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
  let isMounted = true;
  let tableauViz = null;

  async function waitForTableauAndInit() {
    setLoading(true);
    setError(null);

    let tries = 0;
    while (!window.tableau && tries < 50) {
      await new Promise(res => setTimeout(res, 100));
      tries++;
    }
    if (!window.tableau) {
      setError('Tableau API not loaded after waiting. Please refresh.');
      setLoading(false);
      return;
    }

    const url = tableauUrls[department];
    if (!url) {
      setError('Dashboard URL not found.');
      setLoading(false);
      return;
    }

    if (viz) viz.dispose();

    tableauViz = new window.tableau.Viz(
      vizRef.current,
      url,
      {
        hideTabs: true,
        hideToolbar: false,
        width: '100%',
        height: '800px',
        onFirstInteractive: () => {
          if (isMounted) setLoading(false);
        }
      }
    );
    setViz(tableauViz);
  }

  waitForTableauAndInit();

  return () => {
    isMounted = false;
    if (tableauViz) tableauViz.dispose();
  };
// eslint-disable-next-line
}, [department]);


  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {title || `${department.charAt(0).toUpperCase() + department.slice(1)} Dashboard`}
      </Typography>
      
      <Box sx={{ 
        width: '100%', 
        minHeight: 800, 
        border: '1px solid #ddd', 
        borderRadius: 2, 
        boxShadow: 1,
        position: 'relative'
      }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading {department} dashboard...
            </Typography>
          </Box>
        )}
        
        <div 
          ref={vizRef} 
          style={{ 
            width: '100%', 
            height: '800px', 
            visibility: loading ? 'hidden' : 'visible' 
          }} 
        />
      </Box>
    </Container>
  );
}
