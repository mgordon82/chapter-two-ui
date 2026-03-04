import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { Box, CircularProgress } from '@mui/material';

const RequireAuth: React.FC = () => {
  const step = useSelector((s: RootState) => s.auth.step);

  if (step === 'UNINITIALIZED') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (step === 'SIGNED_OUT' || step === 'SIGNING_OUT') {
    return <Navigate to='/login' replace />;
  }

  if (step === 'SIGNING_IN' || step === 'NEW_PASSWORD_REQUIRED') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
};

export default RequireAuth;
