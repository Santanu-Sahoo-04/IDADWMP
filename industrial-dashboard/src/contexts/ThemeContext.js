import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [isDarkMode, fontSize]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const changeFontSize = (size) => setFontSize(size);

  return (
    <ThemeContext.Provider value={{ isDarkMode, fontSize, toggleTheme, changeFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};
