import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';

const PrivateLayout: React.FC = () => {
  return (
    <Box>
      <Header />

      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default PrivateLayout;
