import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2A9D8F'
    },
    secondary: {
      main: '#F4A261'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }
});
