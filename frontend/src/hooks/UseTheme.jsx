import { useState, useEffect } from 'react';

export const UseTheme = () => {
  const [mode, setMode] = useState(() => localStorage.getItem('theme-mode') || 'light');
  const [colorScheme, setColorScheme] = useState(() => localStorage.getItem('color-scheme') || 'blue');

  useEffect(() => {
    const root = document.documentElement;
    
    // Handle light/dark mode
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem('theme-mode', mode);
    
    // Handle color scheme (remove all theme classes first)
    const themes = ['theme-red', 'theme-blue', 'theme-green', 'theme-yellow', 'theme-orange', 'theme-purple', 'theme-black'];
    root.classList.remove(...themes);
    root.classList.add(`theme-${colorScheme}`);
    localStorage.setItem('color-scheme', colorScheme);
    
  }, [mode, colorScheme]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeColorScheme = (scheme) => {
    setColorScheme(scheme);
  };

  return { mode, toggleMode, colorScheme, changeColorScheme };
};