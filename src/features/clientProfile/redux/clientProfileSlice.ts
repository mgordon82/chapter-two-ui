/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ClientProfile } from '../types';

export type ClientProfileState = {
  isLoading: boolean;
  error: string | null;
  profile: ClientProfile | null;
};

const initialState: ClientProfileState = {
  isLoading: false,
  error: null,
  profile: null
};

const clientProfileSlice = createSlice({
  name: 'clientProfile',
  initialState,
  reducers: {
    clientProfileRequested(state, _action: PayloadAction<{ userId: string }>) {
      state.isLoading = true;
      state.error = null;
    },

    clientProfileSucceeded(state, action: PayloadAction<ClientProfile>) {
      state.isLoading = false;
      state.error = null;
      state.profile = action.payload;
    },

    clientProfileFailed(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    clientProfileCleared(state) {
      state.isLoading = false;
      state.error = null;
      state.profile = null;
    }
  }
});

export const {
  clientProfileRequested,
  clientProfileSucceeded,
  clientProfileFailed,
  clientProfileCleared
} = clientProfileSlice.actions;

export default clientProfileSlice.reducer;
