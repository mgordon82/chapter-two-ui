import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Header />

      <Container maxWidth='md' sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;
