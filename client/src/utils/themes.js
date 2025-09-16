// Dynamic theme system based on context
export const themes = {
  Home: {
    name: 'Home',
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    accent: '#f59e0b',
    background: 'from-blue-50 via-cyan-50 to-teal-100',
    cardBackground: 'bg-white/90',
    gradient: 'from-blue-500 to-cyan-600',
    icon: '🏠',
    welcomeMessage: 'Welcome to Your Home Finance Hub',
    description: 'Manage your personal finances and family budget',
  },
  
  Work: {
    name: 'Work',
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    secondary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    accent: '#3b82f6',
    background: 'from-slate-50 via-gray-50 to-zinc-100',
    cardBackground: 'bg-white/95',
    gradient: 'from-slate-600 to-gray-700',
    icon: '💼',
    welcomeMessage: 'Professional Finance Management',
    description: 'Track your work expenses and professional finances',
  },
  
  Business: {
    name: 'Business',
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    accent: '#10b981',
    background: 'from-purple-50 via-violet-50 to-indigo-100',
    cardBackground: 'bg-white/90',
    gradient: 'from-purple-600 to-indigo-700',
    icon: '🏢',
    welcomeMessage: 'Business Finance Command Center',
    description: 'Manage your business finances and growth metrics',
  }
};

// Get theme based on context type
export const getTheme = (contextType) => {
  return themes[contextType] || themes.Home;
};

// Generate CSS custom properties for dynamic theming
export const generateThemeCSS = (theme) => {
  return `
    :root {
      --theme-primary-50: ${theme.primary[50]};
      --theme-primary-100: ${theme.primary[100]};
      --theme-primary-200: ${theme.primary[200]};
      --theme-primary-300: ${theme.primary[300]};
      --theme-primary-400: ${theme.primary[400]};
      --theme-primary-500: ${theme.primary[500]};
      --theme-primary-600: ${theme.primary[600]};
      --theme-primary-700: ${theme.primary[700]};
      --theme-primary-800: ${theme.primary[800]};
      --theme-primary-900: ${theme.primary[900]};
      --theme-secondary-50: ${theme.secondary[50]};
      --theme-secondary-100: ${theme.secondary[100]};
      --theme-secondary-200: ${theme.secondary[200]};
      --theme-secondary-300: ${theme.secondary[300]};
      --theme-secondary-400: ${theme.secondary[400]};
      --theme-secondary-500: ${theme.secondary[500]};
      --theme-secondary-600: ${theme.secondary[600]};
      --theme-secondary-700: ${theme.secondary[700]};
      --theme-secondary-800: ${theme.secondary[800]};
      --theme-secondary-900: ${theme.secondary[900]};
      --theme-accent: ${theme.accent};
    }
  `;
};
