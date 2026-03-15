/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type HealthMetricType = 'steps';
export type HealthMetricRange = '7D' | '30D' | '90D' | '180D' | '365D';

export type HealthMetricDailyItem = {
  _id: string;
  userId: string;
  date: string;
  metricType: HealthMetricType;
  value: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  source?: {
    type?: 'apple_health' | 'manual';
    integration?: 'apple_health' | null;
    appSourceName?: string | null;
    deviceSourceName?: string | null;
    importedAt?: string | null;
  };
};

type FetchDailyMetricsRequestedPayload = {
  metricType: HealthMetricType;
  range: HealthMetricRange;
};

type FetchDailyMetricsSucceededPayload = {
  metricType: HealthMetricType;
  range: HealthMetricRange;
  items: HealthMetricDailyItem[];
};

type HealthMetricsState = {
  daily: {
    items: HealthMetricDailyItem[];
    loading: boolean;
    error: string | null;
    loadedMetricType: HealthMetricType | null;
    loadedRange: HealthMetricRange | null;
  };
};

const initialState: HealthMetricsState = {
  daily: {
    items: [],
    loading: false,
    error: null,
    loadedMetricType: null,
    loadedRange: null
  }
};

const healthMetricsSlice = createSlice({
  name: 'healthMetrics',
  initialState,
  reducers: {
    fetchDailyMetricsRequested(
      state,
      _action: PayloadAction<FetchDailyMetricsRequestedPayload>
    ) {
      state.daily.loading = true;
      state.daily.error = null;
    },
    fetchDailyMetricsSucceeded(
      state,
      action: PayloadAction<FetchDailyMetricsSucceededPayload>
    ) {
      state.daily.loading = false;
      state.daily.items = action.payload.items;
      state.daily.loadedMetricType = action.payload.metricType;
      state.daily.loadedRange = action.payload.range;
    },
    fetchDailyMetricsFailed(state, action: PayloadAction<string>) {
      state.daily.loading = false;
      state.daily.error = action.payload;
    },
    clearDailyMetricsError(state) {
      state.daily.error = null;
    }
  }
});

export const {
  fetchDailyMetricsRequested,
  fetchDailyMetricsSucceeded,
  fetchDailyMetricsFailed,
  clearDailyMetricsError
} = healthMetricsSlice.actions;

export default healthMetricsSlice.reducer;
