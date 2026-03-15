import React from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import {
  forgotPasswordFlowCleared,
  forgotPasswordRequested,
  forgotPasswordSubmitted
} from '../../../auth/authSlice';
import {
  validatePassword,
  passwordsMatch,
  defaultCognitoLikePolicy
} from '../../../auth/helpers/passwordPolicy';
import PasswordRequirementsPopper from '../../../auth/components/PasswordRequirementsPopper';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authStep = useSelector((s: RootState) => s.auth.step);
  const authError = useSelector((s: RootState) => s.auth.error);

  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');

  const [newPasswordTouched, setNewPasswordTouched] = React.useState(false);
  const [confirmTouched, setConfirmTouched] = React.useState(false);

  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] =
    React.useState(false);

  const [pwAnchorEl, setPwAnchorEl] = React.useState<HTMLElement | null>(null);
  const [showPwRules, setShowPwRules] = React.useState(false);

  const requestingCode = authStep === 'FORGOT_PASSWORD_REQUESTING';
  const confirmingReset = authStep === 'FORGOT_PASSWORD_CONFIRMING';
  const codeSent =
    authStep === 'FORGOT_PASSWORD_CODE_SENT' ||
    authStep === 'FORGOT_PASSWORD_CONFIRMING';
  const resetSuccess = authStep === 'FORGOT_PASSWORD_SUCCESS';

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

  const canSubmitRequest = email.trim().length > 0;
  const canSubmitReset =
    email.trim().length > 0 &&
    code.trim().length > 0 &&
    validation.isValid &&
    match;

  React.useEffect(() => {
    if (showPwRules && canSubmitReset) {
      setShowPwRules(false);
    }
  }, [showPwRules, canSubmitReset]);

  React.useEffect(() => {
    return () => {
      dispatch(forgotPasswordFlowCleared());
    };
  }, [dispatch]);

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitRequest) return;

    dispatch(forgotPasswordRequested({ email: email.trim() }));
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();

    setNewPasswordTouched(true);
    setConfirmTouched(true);

    if (!canSubmitReset) return;

    dispatch(
      forgotPasswordSubmitted({
        email: email.trim(),
        code: code.trim(),
        newPassword
      })
    );
  };

  const handleBackToLogin = () => {
    dispatch(forgotPasswordFlowCleared());
    navigate('/login', { state: { emailPrefill: email } });
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

  const popperOpen = showPwRules && !canSubmitReset;

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6 }}>
      <Typography variant='h5' sx={{ mb: 1 }}>
        Forgot password
      </Typography>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        {!codeSent && !resetSuccess
          ? 'Enter your email and we’ll send you a reset code.'
          : resetSuccess
          ? 'Your password has been updated. You can sign in now.'
          : 'Enter the code from your email and choose a new password.'}
      </Typography>

      {!codeSent && !resetSuccess ? (
        <Box component='form' onSubmit={handleRequestCode}>
          <TextField
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin='normal'
            autoComplete='email'
          />

          <Button
            type='submit'
            variant='contained'
            fullWidth
            sx={{ mt: 2 }}
            disabled={!canSubmitRequest || requestingCode}
          >
            {requestingCode ? 'Sending code...' : 'Send reset code'}
          </Button>

          <Button
            variant='text'
            fullWidth
            sx={{ mt: 1 }}
            onClick={handleBackToLogin}
          >
            Back to sign in
          </Button>
        </Box>
      ) : null}

      {codeSent && !resetSuccess ? (
        <Box component='form' onSubmit={handleConfirmReset}>
          <TextField
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin='normal'
            autoComplete='email'
          />

          <TextField
            label='Verification Code'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            margin='normal'
            autoComplete='one-time-code'
          />

          <TextField
            label='New Password'
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (!canSubmitReset) setShowPwRules(true);
            }}
            onFocus={(e) => {
              setPwAnchorEl(e.currentTarget);
              if (!canSubmitReset) setShowPwRules(true);
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
              if (!canSubmitReset) setShowPwRules(true);
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
            disabled={!canSubmitReset || confirmingReset}
          >
            {confirmingReset ? 'Resetting password...' : 'Reset password'}
          </Button>

          <Button
            variant='text'
            fullWidth
            sx={{ mt: 1 }}
            onClick={() =>
              dispatch(forgotPasswordRequested({ email: email.trim() }))
            }
            disabled={!email.trim() || requestingCode || confirmingReset}
          >
            Resend code
          </Button>

          <Button
            variant='text'
            fullWidth
            sx={{ mt: 1 }}
            onClick={handleBackToLogin}
          >
            Back to sign in
          </Button>
        </Box>
      ) : null}

      {resetSuccess ? (
        <Box>
          <Button
            variant='contained'
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleBackToLogin}
          >
            Back to sign in
          </Button>
        </Box>
      ) : null}

      {codeSent && !resetSuccess && !authError ? (
        <Typography sx={{ mt: 2 }} color='success.main'>
          A reset code has been sent to your email.
        </Typography>
      ) : null}

      {resetSuccess && !authError ? (
        <Typography sx={{ mt: 2 }} color='success.main'>
          Your password has been reset successfully.
        </Typography>
      ) : null}

      {authError ? (
        <Typography sx={{ mt: 1 }} color='error'>
          {authError}
        </Typography>
      ) : null}
    </Box>
  );
};

export default ForgotPassword;
