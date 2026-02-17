import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2A9D8F'
    },
    secondary: {
      main: '#F4A261'
    }
  },

  shape: {
    borderRadius: 12
  },

  typography: {
    // Default body font
    fontFamily: '"Source Sans 3", sans-serif',

    h1: {
      fontFamily: '"Anton", sans-serif',
      letterSpacing: '0.02em'
    },
    h2: {
      fontFamily: '"Anton", sans-serif',
      letterSpacing: '0.02em'
    },
    h3: {
      fontFamily: '"Anton", sans-serif',
      letterSpacing: '0.02em'
    },
    h4: {
      fontFamily: '"Anton", sans-serif'
    },
    h5: {
      fontFamily: '"Anton", sans-serif'
    },
    h6: {
      fontFamily: '"Anton", sans-serif'
    }
  }
});
