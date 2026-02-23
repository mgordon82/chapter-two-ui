import React from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  inviteUserCleared,
  inviteUserRequested
} from './redux/inviteUserSlice';

const InviteUser: React.FC = () => {
  const dispatch = useAppDispatch();

  const [email, setEmail] = React.useState('');

  const { isInviting, error, hasInvited, lastResult } = useAppSelector(
    (s) => s.inviteUser
  );

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();

    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim) return;

    dispatch(inviteUserCleared());

    dispatch(
      inviteUserRequested({
        email: emailTrim,
        role: 'client'
      })
    );
  };

  React.useEffect(() => {
    if (hasInvited || error) dispatch(inviteUserCleared());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6 }}>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Invite User
      </Typography>

      <Box component='form' onSubmit={handleInviteUser}>
        <Typography sx={{ mb: 1 }}>Invite the new user below</Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {hasInvited && lastResult && (
          <Alert severity='success' sx={{ mb: 2 }}>
            Invite sent to <strong>{lastResult.email}</strong>
          </Alert>
        )}

        <TextField
          label='Enter Email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin='normal'
          autoComplete='email'
          disabled={isInviting}
        />

        <Button
          type='submit'
          variant='contained'
          fullWidth
          sx={{ mt: 2 }}
          disabled={isInviting || !email.trim()}
        >
          {isInviting ? 'Sending…' : 'Invite User'}
        </Button>
      </Box>
    </Box>
  );
};

export default InviteUser;
