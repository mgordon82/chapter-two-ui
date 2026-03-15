/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CurrentUser } from './helpers/fetchCurrentUser';

export type AuthStep =
  | 'UNINITIALIZED'
  | 'SIGNED_OUT'
  | 'SIGNING_IN'
  | 'SIGNING_OUT'
  | 'NEW_PASSWORD_REQUIRED'
  | 'FORGOT_PASSWORD_REQUESTING'
  | 'FORGOT_PASSWORD_CODE_SENT'
  | 'FORGOT_PASSWORD_CONFIRMING'
  | 'FORGOT_PASSWORD_SUCCESS'
  | 'CHANGING_PASSWORD'
  | 'PASSWORD_CHANGE_SUCCESS'
  | 'SIGNED_IN';

type AuthState = {
  step: AuthStep;
  error: string | null;
  currentUser: CurrentUser | null;
};

const initialState: AuthState = {
  step: 'UNINITIALIZED',
  error: null,
  currentUser: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authInitRequested: (state) => {
      state.step = 'SIGNING_IN';
    },

    loginRequested: (
      state,
      _action: PayloadAction<{ email: string; password: string }>
    ) => {
      state.step = 'SIGNING_IN';
      state.error = null;
    },

    newPasswordSubmitted: (
      state,
      _action: PayloadAction<{
        email: string;
        password: string;
        newPassword: string;
      }>
    ) => {
      state.step = 'SIGNING_IN';
      state.error = null;
    },

    forgotPasswordRequested: (
      state,
      _action: PayloadAction<{ email: string }>
    ) => {
      state.step = 'FORGOT_PASSWORD_REQUESTING';
      state.error = null;
    },

    forgotPasswordSubmitted: (
      state,
      _action: PayloadAction<{
        email: string;
        code: string;
        newPassword: string;
      }>
    ) => {
      state.step = 'FORGOT_PASSWORD_CONFIRMING';
      state.error = null;
    },

    forgotPasswordFlowCleared: (state) => {
      state.step = 'SIGNED_OUT';
      state.error = null;
    },

    logoutRequested: (state) => {
      state.step = 'SIGNING_OUT';
      state.error = null;
    },

    authStepSet: (state, action: PayloadAction<AuthStep>) => {
      state.step = action.payload;
      if (action.payload !== 'SIGNED_OUT') {
        state.error = null;
      }
    },

    authErrorSet: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    currentUserSet: (state, action: PayloadAction<CurrentUser | null>) => {
      state.currentUser = action.payload;
    },
    changePasswordRequested: (
      state,
      _action: PayloadAction<{
        currentPassword: string;
        newPassword: string;
      }>
    ) => {
      state.step = 'CHANGING_PASSWORD';
      state.error = null;
    },

    changePasswordFlowCleared: (state) => {
      if (state.step === 'PASSWORD_CHANGE_SUCCESS') {
        state.step = 'SIGNED_IN';
      }
      state.error = null;
    }
  }
});

export const {
  authInitRequested,
  loginRequested,
  newPasswordSubmitted,
  forgotPasswordRequested,
  forgotPasswordSubmitted,
  forgotPasswordFlowCleared,
  changePasswordRequested,
  changePasswordFlowCleared,
  logoutRequested,
  authStepSet,
  authErrorSet,
  currentUserSet
} = authSlice.actions;

export default authSlice.reducer;
