import React from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  inviteUserCleared,
  inviteUserRequested,
  type RoleField
} from './redux/inviteUserSlice';
import { coachOptionsRequested } from './redux/coachOptionsSlice';
import { getEffectiveRoles } from '../../components/navigation/navConfig';

const ALL_ROLES: RoleField[] = ['client', 'coach', 'admin', 'staff'];

const InviteUser: React.FC = () => {
  const dispatch = useAppDispatch();

  const [email, setEmail] = React.useState('');
  const [roles, setRoles] = React.useState<RoleField[]>(['client']);
  const [selectedCoachId, setSelectedCoachId] = React.useState('');
  const [assignToMe, setAssignToMe] = React.useState(false);

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const effectiveRoles = getEffectiveRoles(currentUser);

  const isAdminLike =
    effectiveRoles.includes('admin') || effectiveRoles.includes('staff');
  const isCoach =
    effectiveRoles.includes('coach') && !effectiveRoles.includes('admin');

  const { isInviting, error, hasInvited, lastResult } = useAppSelector(
    (s) => s.inviteUser
  );

  const {
    items: coachOptions,
    isLoading: isLoadingCoaches,
    error: coachOptionsError
  } = useAppSelector((s) => s.coachOptions);

  React.useEffect(() => {
    if (isAdminLike) {
      dispatch(coachOptionsRequested());
    }
  }, [dispatch, isAdminLike]);

  const resolvedCoachId = isAdminLike
    ? selectedCoachId || null
    : isCoach && assignToMe && currentUser?.id
    ? currentUser.id
    : null;

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();

    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim) return;
    if (roles.length === 0) return;

    dispatch(inviteUserCleared());

    dispatch(
      inviteUserRequested({
        email: emailTrim,
        roles,
        coachId: resolvedCoachId
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

        {coachOptionsError && isAdminLike ? (
          <Alert severity='warning' sx={{ mb: 2 }}>
            {coachOptionsError}
          </Alert>
        ) : null}

        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' sx={{ mb: 1 }}>
            Roles
          </Typography>

          <ToggleButtonGroup
            value={roles}
            onChange={(_, nextRoles: RoleField[]) => {
              if (nextRoles.length > 0) {
                setRoles(nextRoles);
              }
            }}
            fullWidth
            disabled={isInviting}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 1,
              '& .MuiToggleButtonGroup-grouped': {
                borderRadius: '8px !important',
                border: (theme) =>
                  `1px solid ${theme.palette.divider} !important`
              },
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                py: 1.2
              }
            }}
          >
            {ALL_ROLES.map((role) => (
              <ToggleButton key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {isAdminLike ? (
          <TextField
            select
            fullWidth
            size='small'
            label='Assign Coach (optional)'
            value={selectedCoachId}
            onChange={(e) => setSelectedCoachId(e.target.value)}
            margin='normal'
            disabled={isInviting || isLoadingCoaches}
          >
            <MenuItem value=''>Unassigned</MenuItem>

            {coachOptions.map((coach) => (
              <MenuItem key={coach.id} value={coach.id}>
                {coach.displayName || coach.email}
              </MenuItem>
            ))}
          </TextField>
        ) : null}

        {isCoach ? (
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={assignToMe}
                  onChange={(e) => setAssignToMe(e.target.checked)}
                  disabled={isInviting}
                />
              }
              label='Assign this user to me'
            />
          </Box>
        ) : null}

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
          disabled={isInviting || !email.trim() || roles.length === 0}
        >
          {isInviting ? 'Sending…' : 'Invite User'}
        </Button>
      </Box>
    </Box>
  );
};

export default InviteUser;
