/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CurrentUser } from './helpers/fetchCurrentUser';

export type AuthStep =
  | 'UNINITIALIZED'
  | 'SIGNED_OUT'
  | 'SIGNING_IN'
  | 'SIGNING_OUT'
  | 'NEW_PASSWORD_REQUIRED'
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
      _action: PayloadAction<{ newPassword: string }>
    ) => {
      state.step = 'SIGNING_IN';
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
    }
  }
});

export const {
  authInitRequested,
  loginRequested,
  newPasswordSubmitted,
  logoutRequested,
  authStepSet,
  authErrorSet,
  currentUserSet
} = authSlice.actions;

export default authSlice.reducer;
