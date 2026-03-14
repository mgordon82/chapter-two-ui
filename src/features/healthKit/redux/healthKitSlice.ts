import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type HealthKitSyncSummary = {
  total: number;
  createdCount: number;
  duplicateCount: number;
  conflictCount: number;
};

type HealthKitState = {
  syncing: boolean;
  lastSummary: HealthKitSyncSummary | null;
  error: string | null;
};

const initialState: HealthKitState = {
  syncing: false,
  lastSummary: null,
  error: null
};

const healthKitSlice = createSlice({
  name: 'healthKit',
  initialState,
  reducers: {
    healthKitSyncRequested(state) {
      state.syncing = true;
      state.error = null;
    },
    healthKitSyncSucceeded(state, action: PayloadAction<HealthKitSyncSummary>) {
      state.syncing = false;
      state.lastSummary = action.payload;
    },
    healthKitSyncFailed(state, action: PayloadAction<string>) {
      state.syncing = false;
      state.error = action.payload;
    },
    clearHealthKitError(state) {
      state.error = null;
    },
    clearHealthKitSummary(state) {
      state.lastSummary = null;
    }
  }
});

export const {
  healthKitSyncRequested,
  healthKitSyncSucceeded,
  healthKitSyncFailed,
  clearHealthKitError,
  clearHealthKitSummary
} = healthKitSlice.actions;

export default healthKitSlice.reducer;
