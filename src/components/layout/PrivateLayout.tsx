import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';
import { useAppSelector } from '../../app/hooks';

const drawerWidth = 240;

const PrivateLayout: React.FC = () => {
  const hasUser = useAppSelector((s) => Boolean(s.auth.currentUser));

  return (
    <Box
      sx={{
        ml: { md: hasUser ? `${drawerWidth}px` : 0 },
        minHeight: '100vh'
      }}
    >
      <Header />

      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default PrivateLayout;
