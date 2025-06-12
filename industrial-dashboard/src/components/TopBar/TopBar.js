import React from 'react';
import { Container, Box, IconButton, Typography } from '@mui/material';
import { MdTextDecrease, MdTextIncrease, MdTextFields, MdLightMode, MdDarkMode,   MdLanguage } from 'react-icons/md';
import { useTranslation } from 'react-i18next'; // ADD THIS IMPORT
import { useFontSize } from '../../contexts/FontSizeContext';
import './TopBar.css';

export default function TopBar({ isDarkMode, setIsDarkMode }) {
  const { fontLevel, increase, decrease, reset, canIncrease, canDecrease } = useFontSize();

  // ADD THIS - Translation hook
  const { t, i18n } = useTranslation();
  
  // ADD THIS - Language toggle function
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

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

        {/* ADD THIS ENTIRE SECTION - Language Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>Language:</Typography>
          <IconButton 
            size="small" 
            onClick={toggleLanguage}
            sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              px: 1,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
            title={`Switch to ${i18n.language === 'en' ? 'Hindi' : 'English'}`}
          >
            <MdLanguage sx={{ mr: 0.5, fontSize: '1rem' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {t('topbar.language')}
            </Typography>
          </IconButton>
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
