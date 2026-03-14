import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';
import { useAppSelector } from '../../app/hooks';
import { useDispatch } from 'react-redux';
import { fetchStarterPhotosRequested } from '../../features/photos/redux/photosSlice';

const drawerWidth = 240;

const PrivateLayout: React.FC = () => {
  const dispatch = useDispatch();
  const hasUser = useAppSelector((s) => Boolean(s.auth.currentUser));

  useEffect(() => {
    if (hasUser) {
      dispatch(fetchStarterPhotosRequested());
    }
  }, [dispatch, hasUser]);

  return (
    <Box
      sx={{
        ml: { md: hasUser ? `${drawerWidth}px` : 0 },
        minHeight: '100vh'
      }}
    >
      <Header />

      <Container
        maxWidth='lg'
        sx={{
          py: { xs: 2, md: 4 },
          px: { xs: 2, sm: 3 }
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default PrivateLayout;
