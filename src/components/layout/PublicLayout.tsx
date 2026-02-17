import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

const PublicLayout: React.FC = () => {
  return (
    <Box>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default PublicLayout;
