/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AssignCoachRequest = {
  userId: string;
  coachId: string | null;
};

export type AssignCoachResponse = {
  ok: true;
};

export type AssignCoachState = {
  isSaving: boolean;
  error: string | null;
};

const initialState: AssignCoachState = {
  isSaving: false,
  error: null
};

const assignCoachSlice = createSlice({
  name: 'assignCoach',
  initialState,
  reducers: {
    assignCoachRequested(state, _action: PayloadAction<AssignCoachRequest>) {
      state.isSaving = true;
      state.error = null;
    },
    assignCoachSucceeded(state, _action: PayloadAction<AssignCoachResponse>) {
      state.isSaving = false;
      state.error = null;
    },
    assignCoachFailed(state, action: PayloadAction<string>) {
      state.isSaving = false;
      state.error = action.payload;
    },
    assignCoachCleared(state) {
      state.isSaving = false;
      state.error = null;
    }
  }
});

export const {
  assignCoachRequested,
  assignCoachSucceeded,
  assignCoachFailed,
  assignCoachCleared
} = assignCoachSlice.actions;

export default assignCoachSlice.reducer;
