// src/pages/public/Login/index.tsx
import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import { loginRequested, newPasswordSubmitted } from '../../../auth/authSlice';

type LocationState = {
  from?: { pathname: string };
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { state } = useLocation();
  const from =
    (state as LocationState | null)?.from?.pathname || '/app/meal-generator';

  const authStep = useSelector((s: RootState) => s.auth.step);
  const authError = useSelector((s: RootState) => s.auth.error);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');

  const needsNewPassword = authStep === 'NEW_PASSWORD_REQUIRED';
  const signingIn = authStep === 'SIGNING_IN';

  React.useEffect(() => {
    if (authStep === 'SIGNED_IN') {
      navigate(from, { replace: true });
    }
  }, [authStep, from, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequested({ email, password }));
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(newPasswordSubmitted({ newPassword }));
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6 }}>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Sign in
      </Typography>

      {!needsNewPassword ? (
        <Box component='form' onSubmit={handleLogin}>
          <TextField
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin='normal'
            autoComplete='email'
          />

          <TextField
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin='normal'
            autoComplete='current-password'
          />

          <Button
            type='submit'
            variant='contained'
            fullWidth
            sx={{ mt: 2 }}
            disabled={signingIn}
          >
            {signingIn ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
      ) : (
        <Box component='form' onSubmit={handleSetNewPassword}>
          <Typography sx={{ mb: 1 }}>
            You've been invited — set a new password to finish setup.
          </Typography>

          <TextField
            label='New Password'
            type='password'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin='normal'
            autoComplete='new-password'
          />

          <Button type='submit' variant='contained' fullWidth sx={{ mt: 2 }}>
            Set new password
          </Button>
        </Box>
      )}

      {/* Status text (simple) */}
      {authStep === 'SIGNING_IN' && (
        <Typography sx={{ mt: 2 }}>Signing in…</Typography>
      )}
      {needsNewPassword && (
        <Typography sx={{ mt: 2 }}>New password required.</Typography>
      )}

      {authError ? (
        <Typography sx={{ mt: 1 }} color='error'>
          {authError}
        </Typography>
      ) : null}
    </Box>
  );
};

export default Login;
