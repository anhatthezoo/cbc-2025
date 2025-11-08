import React, { createContext, useContext, ReactNode } from 'react';
import { useFonts } from 'expo-font';

export const theme = {
  colors: {
    // Anthropic brand colors
    primary: '#D97757',        // Warm coral/orange
    primaryDark: '#C85A38',    // Darker shade for pressed states
    primaryLight: '#FFEBE5',   // Light tint for backgrounds

    // Neutrals - clean and modern
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',

    // Text colors
    text: '#1F2937',           // Primary text
    textSecondary: '#6B7280',  // Secondary text
    textTertiary: '#9CA3AF',   // Disabled/tertiary text

    // Borders
    border: '#E5E7EB',
    borderFocus: '#D97757',

    // States
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },

  typography: {
    // Font families
    fontFamily: {
      regular: 'Inter',
      italic: 'Inter-Italic',
    },

    // Font sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },

    // Font weights
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },

    // Line heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  shadows: {
    // iOS-inspired shadows
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

export type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [fontsLoaded] = useFonts({
    'Inter': require('../assets/fonts/InterVariable.ttf'),
    'Inter-Italic': require('../assets/fonts/InterVariable-Italic.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
