import React, { useState, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { useTheme } from '@mui/material/styles';
import './GoToTop.css';

export default function GoToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div className={`go-to-top ${isDarkMode ? 'dark' : 'light'}`}>
      <IconButton 
        onClick={scrollToTop}
        className="go-to-top-btn"
        size="large"
      >
        <MdKeyboardArrowUp />
      </IconButton>
    </div>
  );
}
