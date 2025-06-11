import React from 'react';
import { Container, Box, IconButton, Typography } from '@mui/material';
import { MdTextDecrease, MdTextIncrease, MdTextFields, MdLightMode, MdDarkMode } from 'react-icons/md';
import { useFontSize } from '../../contexts/FontSizeContext';
import './TopBar.css';

export default function TopBar({ isDarkMode, setIsDarkMode }) {
  const { fontLevel, increase, decrease, reset, canIncrease, canDecrease } = useFontSize();

  return (
    <Box className="top-bar" sx={{ 
      background: isDarkMode ? 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(90deg, #0d47a1 0%, #1565c0 100%)', 
      color: 'white', 
      py: 1 
    }}>
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
        {/* Font Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>Font Size:</Typography>
          <IconButton 
            size="small" 
            onClick={decrease} 
            disabled={!canDecrease}
            sx={{ color: 'white', opacity: canDecrease ? 1 : 0.5 }}
            title="Decrease Font Size"
          >
            <MdTextDecrease />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={reset}
            sx={{ 
              color: 'white', 
              backgroundColor: fontLevel === 0 ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
            title="Reset to Default"
          >
            <MdTextFields />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={increase} 
            disabled={!canIncrease}
            sx={{ color: 'white', opacity: canIncrease ? 1 : 0.5 }}
            title="Increase Font Size"
          >
            <MdTextIncrease />
          </IconButton>
          {fontLevel !== 0 && (
            <Typography variant="caption" sx={{ ml: 1, minWidth: '20px' }}>
              {fontLevel > 0 ? `+${fontLevel}` : fontLevel}
            </Typography>
          )}
        </Box>

        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>Theme:</Typography>
          <IconButton 
            size="small" 
            onClick={() => setIsDarkMode(v => !v)} 
            sx={{ color: 'white' }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
