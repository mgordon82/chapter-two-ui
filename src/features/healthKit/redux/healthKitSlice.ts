import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type HealthKitMetricSyncSummary = {
  total: number;
  createdCount: number;
  updatedCount: number;
  duplicateCount: number;
  conflictCount: number;
};

export type HealthKitSyncSummary = {
  weight: HealthKitMetricSyncSummary;
  steps: HealthKitMetricSyncSummary;
};

type HealthKitState = {
  syncing: boolean;
  lastSummary: HealthKitSyncSummary | null;
  error: string | null;
};

const emptyMetricSummary = (): HealthKitMetricSyncSummary => ({
  total: 0,
  createdCount: 0,
  updatedCount: 0,
  duplicateCount: 0,
  conflictCount: 0
});

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
    },
    clearHealthKitState(state) {
      state.syncing = false;
      state.error = null;
      state.lastSummary = null;
    }
  }
});

export const buildEmptyHealthKitSyncSummary = (): HealthKitSyncSummary => ({
  weight: emptyMetricSummary(),
  steps: emptyMetricSummary()
});

export const {
  healthKitSyncRequested,
  healthKitSyncSucceeded,
  healthKitSyncFailed,
  clearHealthKitError,
  clearHealthKitSummary,
  clearHealthKitState
} = healthKitSlice.actions;

export default healthKitSlice.reducer;
