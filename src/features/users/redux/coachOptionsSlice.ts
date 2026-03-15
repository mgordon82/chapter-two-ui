import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CoachOption = {
  id: string;
  displayName: string | null;
  email: string;
};

export type CoachOptionsResponse = {
  items: CoachOption[];
};

export type CoachOptionsState = {
  isLoading: boolean;
  error: string | null;
  items: CoachOption[];
};

const initialState: CoachOptionsState = {
  isLoading: false,
  error: null,
  items: []
};

const coachOptionsSlice = createSlice({
  name: 'coachOptions',
  initialState,
  reducers: {
    coachOptionsRequested(state) {
      state.isLoading = true;
      state.error = null;
    },
    coachOptionsSucceeded(state, action: PayloadAction<CoachOptionsResponse>) {
      state.isLoading = false;
      state.error = null;
      state.items = action.payload.items;
    },
    coachOptionsFailed(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    coachOptionsCleared(state) {
      state.isLoading = false;
      state.error = null;
      state.items = [];
    }
  }
});

export const {
  coachOptionsRequested,
  coachOptionsSucceeded,
  coachOptionsFailed,
  coachOptionsCleared
} = coachOptionsSlice.actions;

export default coachOptionsSlice.reducer;
