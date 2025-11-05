import { createTheme } from '@mui/material/styles';

// Design tokens as specified
const tokens = {
  colors: {
    primary: '#1b8f4b',
    primaryDark: '#157a3f', // Darker for better contrast
    primaryLight: '#dff3e8',
    bg: '#f6f8f5',
    text: '#0a2415',
  },
  radii: {
    card: 24,
    heroContainer: 32,
  },
  shadows: {
    large: '0px 8px 24px rgba(0, 0, 0, 0.08), 0px 2px 8px rgba(0, 0, 0, 0.04)',
  },
  typography: {
    display: {
      fontSize: 56,
      lineHeight: 64 / 56,
      fontWeight: 600,
    },
    h2: {
      fontSize: 28,
      lineHeight: 36 / 28,
      fontWeight: 600,
    },
    body: {
      fontSize: 16,
      lineHeight: 28 / 16,
      fontWeight: 400,
    },
  },
  spacing: 8, // base 8px
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.colors.primary,
      dark: tokens.colors.primaryDark,
      light: tokens.colors.primaryLight,
    },
    background: {
      default: tokens.colors.bg,
      paper: '#ffffff',
    },
    text: {
      primary: tokens.colors.text,
      secondary: 'rgba(10, 36, 21, 0.7)',
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: tokens.typography.display.fontSize,
      lineHeight: tokens.typography.display.lineHeight,
      fontWeight: tokens.typography.display.fontWeight,
      '@media (max-width:600px)': {
        fontSize: 40,
        lineHeight: 1.2,
      },
    },
    h2: {
      fontSize: tokens.typography.h2.fontSize,
      lineHeight: tokens.typography.h2.lineHeight,
      fontWeight: tokens.typography.h2.fontWeight,
    },
    body1: {
      fontSize: tokens.typography.body.fontSize,
      lineHeight: tokens.typography.body.lineHeight,
      fontWeight: tokens.typography.body.fontWeight,
    },
  },
  spacing: tokens.spacing,
  shape: {
    borderRadius: tokens.radii.card,
  },
  shadows: [
    'none',
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
    tokens.shadows.large,
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: tokens.radii.card,
          fontWeight: 600,
        },
        contained: {
          backgroundColor: tokens.colors.primaryDark,
          '&:hover': {
            backgroundColor: '#0f5e2f',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radii.card,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radii.card,
        },
      },
    },
  },
});

export default theme;
export { tokens };
