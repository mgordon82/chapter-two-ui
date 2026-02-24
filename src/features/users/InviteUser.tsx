import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  inviteUserCleared,
  inviteUserRequested,
  type RoleField
} from './redux/inviteUserSlice';

const InviteUser: React.FC = () => {
  const dispatch = useAppDispatch();

  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<RoleField>('client');

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
        role
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

        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' sx={{ mb: 1 }}>
            Role
          </Typography>

          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(_, nextRole: RoleField | null) => {
              // prevent "unselect" which would set null
              if (nextRole) setRole(nextRole);
            }}
            fullWidth
            disabled={isInviting}
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                py: 1.2
              }
            }}
          >
            <ToggleButton value='client'>Client</ToggleButton>
            <ToggleButton value='coach'>Coach</ToggleButton>
            <ToggleButton value='admin'>Admin</ToggleButton>
            <ToggleButton value='staff'>Staff</ToggleButton>
          </ToggleButtonGroup>
        </Box>

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
