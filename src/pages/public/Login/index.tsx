import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import { loginRequested, newPasswordSubmitted } from '../../../auth/authSlice';

import {
  validatePassword,
  passwordsMatch,
  defaultCognitoLikePolicy
} from '../../../auth/helpers/passwordPolicy';
import PasswordRequirementsPopper from '../../../auth/components/PasswordRequirementsPopper';

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
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [newPasswordTouched, setNewPasswordTouched] = React.useState(false);
  const [confirmTouched, setConfirmTouched] = React.useState(false);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] =
    React.useState(false);

  const [pwAnchorEl, setPwAnchorEl] = React.useState<HTMLElement | null>(null);
  const [showPwRules, setShowPwRules] = React.useState(false);

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

  const canSubmitNewPassword = validation.isValid && match;

  React.useEffect(() => {
    if (showPwRules && canSubmitNewPassword) {
      setShowPwRules(false);
    }
  }, [showPwRules, canSubmitNewPassword]);

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();

    setNewPasswordTouched(true);
    setConfirmTouched(true);

    if (!canSubmitNewPassword) return;

    setShowPwRules(false);
    dispatch(newPasswordSubmitted({ email, password, newPassword }));
  };

  const passwordAdornment = (shown: boolean, toggle: () => void) => (
    <InputAdornment position='end'>
      <IconButton
        aria-label={shown ? 'Hide password' : 'Show password'}
        onClick={toggle}
        edge='end'
      >
        {shown ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
    </InputAdornment>
  );

  const popperOpen = showPwRules && !canSubmitNewPassword;

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
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin='normal'
            autoComplete='current-password'
            InputProps={{
              endAdornment: passwordAdornment(showPassword, () =>
                setShowPassword((v) => !v)
              )
            }}
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
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (!canSubmitNewPassword) setShowPwRules(true);
            }}
            onFocus={(e) => {
              setPwAnchorEl(e.currentTarget);
              if (!canSubmitNewPassword) setShowPwRules(true);
            }}
            onBlur={() => setNewPasswordTouched(true)}
            fullWidth
            margin='normal'
            autoComplete='new-password'
            error={
              newPasswordTouched &&
              newPassword.length > 0 &&
              !validation.isValid
            }
            helperText={
              newPasswordTouched &&
              newPassword.length > 0 &&
              !validation.isValid
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
              if (!canSubmitNewPassword) setShowPwRules(true);
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
            fullWidth
            sx={{ mt: 2 }}
            disabled={!canSubmitNewPassword}
          >
            Set new password
          </Button>
        </Box>
      )}

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
