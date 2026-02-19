import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import BackgroundImg from '../../assets/background.svg?url';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  const drawerWidth = 240;

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          backgroundImage: `url("${BackgroundImg}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '809px'
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}
      />

      <Box
        sx={{
          ml: { md: `${drawerWidth}px` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
};

export default AppLayout;
