import { useEffect } from 'react';
import { getTheme, generateThemeCSS } from '../utils/themes';

export const useTheme = (contextType) => {
  const theme = getTheme(contextType);

  useEffect(() => {
    // Apply theme CSS variables to document
    const style = document.createElement('style');
    style.textContent = generateThemeCSS(theme);
    document.head.appendChild(style);

    // Cleanup function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  return theme;
};
