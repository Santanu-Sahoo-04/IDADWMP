import React, { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export const useFontSize = () => useContext(FontSizeContext);

export const FontSizeProvider = ({ children }) => {
  const [fontLevel, setFontLevel] = useState(0);
  const MIN_LEVEL = -7;
  const MAX_LEVEL = 7;
  const BASE_SIZE = 16; // Base font size in px
  const STEP = 1.5; // Size change per click

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${BASE_SIZE + (fontLevel * STEP)}px`);
  }, [fontLevel]);

  const increase = () => setFontLevel(prev => Math.min(prev + 1, MAX_LEVEL));
  const decrease = () => setFontLevel(prev => Math.max(prev - 1, MIN_LEVEL));
  const reset = () => setFontLevel(0);

  return (
    <FontSizeContext.Provider value={{
      fontLevel,
      increase,
      decrease,
      reset,
      canIncrease: fontLevel < MAX_LEVEL,
      canDecrease: fontLevel > MIN_LEVEL,
      isNormal: fontLevel === 0
    }}>
      {children}
    </FontSizeContext.Provider>
  );
};
