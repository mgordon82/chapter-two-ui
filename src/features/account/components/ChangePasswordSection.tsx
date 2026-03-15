import React from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import {
  changePasswordFlowCleared,
  changePasswordRequested
} from '../../../auth/authSlice';
import {
  defaultCognitoLikePolicy,
  passwordsMatch,
  validatePassword
} from '../../../auth/helpers/passwordPolicy';
import PasswordRequirementsPopper from '../../../auth/components/PasswordRequirementsPopper';

const ChangePasswordSection = () => {
  const dispatch = useDispatch();

  const authStep = useSelector((s: RootState) => s.auth.step);
  const authError = useSelector((s: RootState) => s.auth.error);

  const changingPassword = authStep === 'CHANGING_PASSWORD';
  const passwordChangeSuccess = authStep === 'PASSWORD_CHANGE_SUCCESS';

  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

  const [currentPasswordTouched, setCurrentPasswordTouched] =
    React.useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = React.useState(false);
  const [confirmTouched, setConfirmTouched] = React.useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] =
    React.useState(false);

  const [pwAnchorEl, setPwAnchorEl] = React.useState<HTMLElement | null>(null);
  const [showPwRules, setShowPwRules] = React.useState(false);

  const validation = React.useMemo(
    () => validatePassword(newPassword, defaultCognitoLikePolicy),
    [newPassword]
  );

  const match = React.useMemo(
    () => passwordsMatch(newPassword, confirmNewPassword),
    [newPassword, confirmNewPassword]
  );

  const showMismatchError =
    confirmTouched &&
    confirmNewPassword.length > 0 &&
    newPassword.length > 0 &&
    !match;

  const showCurrentPasswordError =
    currentPasswordTouched && currentPassword.trim().length === 0;

  const canSubmit =
    currentPassword.trim().length > 0 && validation.isValid && match;

  React.useEffect(() => {
    if (showPwRules && canSubmit) {
      setShowPwRules(false);
    }
  }, [showPwRules, canSubmit]);

  React.useEffect(() => {
    if (passwordChangeSuccess) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setCurrentPasswordTouched(false);
      setNewPasswordTouched(false);
      setConfirmTouched(false);
      setShowPwRules(false);
    }
  }, [passwordChangeSuccess]);

  React.useEffect(() => {
    return () => {
      dispatch(changePasswordFlowCleared());
    };
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setCurrentPasswordTouched(true);
    setNewPasswordTouched(true);
    setConfirmTouched(true);

    if (!canSubmit) return;

    dispatch(
      changePasswordRequested({
        currentPassword,
        newPassword
      })
    );
  };

  const passwordAdornment = (shown: boolean, toggle: () => void) => (
    <InputAdornment position='end'>
      <IconButton
        type='button'
        aria-label={shown ? 'Hide password' : 'Show password'}
        onClick={toggle}
        edge='end'
      >
        {shown ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
    </InputAdornment>
  );

  const popperOpen = showPwRules && !canSubmit;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        minWidth: 0
      }}
    >
      <Typography variant='h6' sx={{ mb: 1 }}>
        Change Password
      </Typography>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Update your password for this account.
      </Typography>

      <Box component='form' onSubmit={handleSubmit}>
        <TextField
          label='Current Password'
          type={showCurrentPassword ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          onBlur={() => setCurrentPasswordTouched(true)}
          fullWidth
          margin='normal'
          autoComplete='current-password'
          error={showCurrentPasswordError}
          helperText={
            showCurrentPasswordError ? 'Current password is required.' : ' '
          }
          InputProps={{
            endAdornment: passwordAdornment(showCurrentPassword, () =>
              setShowCurrentPassword((v) => !v)
            )
          }}
        />

        <TextField
          label='New Password'
          type={showNewPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (!canSubmit) setShowPwRules(true);
          }}
          onFocus={(e) => {
            setPwAnchorEl(e.currentTarget);
            if (!canSubmit) setShowPwRules(true);
          }}
          onBlur={() => setNewPasswordTouched(true)}
          fullWidth
          margin='normal'
          autoComplete='new-password'
          error={
            newPasswordTouched && newPassword.length > 0 && !validation.isValid
          }
          helperText={
            newPasswordTouched && newPassword.length > 0 && !validation.isValid
              ? 'Password does not meet the requirements.'
              : ' '
          }
          InputProps={{
            endAdornment: passwordAdornment(showNewPassword, () =>
              setShowNewPassword((v) => !v)
            )
          }}
        />

        <PasswordRequirementsPopper
          anchorEl={pwAnchorEl}
          open={popperOpen}
          rules={validation.rules}
          title='Password must include:'
        />

        <TextField
          label='Confirm New Password'
          type={showConfirmNewPassword ? 'text' : 'password'}
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          onFocus={(e) => {
            setPwAnchorEl(e.currentTarget);
            if (!canSubmit) setShowPwRules(true);
          }}
          onBlur={() => setConfirmTouched(true)}
          fullWidth
          margin='normal'
          autoComplete='new-password'
          error={showMismatchError}
          helperText={showMismatchError ? 'Passwords do not match.' : ' '}
          InputProps={{
            endAdornment: passwordAdornment(showConfirmNewPassword, () =>
              setShowConfirmNewPassword((v) => !v)
            )
          }}
        />

        <Button
          type='submit'
          variant='contained'
          sx={{ mt: 2 }}
          disabled={!canSubmit || changingPassword}
        >
          {changingPassword ? 'Updating Password...' : 'Update Password'}
        </Button>
      </Box>

      {passwordChangeSuccess && !authError ? (
        <Typography sx={{ mt: 2 }} color='success.main'>
          Password updated successfully.
        </Typography>
      ) : null}

      {authError ? (
        <Typography sx={{ mt: 2 }} color='error'>
          {authError}
        </Typography>
      ) : null}
    </Paper>
  );
};

export default ChangePasswordSection;
