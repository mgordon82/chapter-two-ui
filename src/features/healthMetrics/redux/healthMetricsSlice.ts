import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type HealthMetricType = 'steps' | 'water';
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

type HealthMetricDailyBucket = {
  items: HealthMetricDailyItem[];
  loading: boolean;
  error: string | null;
  loadedRange: HealthMetricRange | null;
};

type HealthMetricsState = {
  daily: Record<HealthMetricType, HealthMetricDailyBucket>;
};

const createDailyBucket = (): HealthMetricDailyBucket => ({
  items: [],
  loading: false,
  error: null,
  loadedRange: null
});

const initialState: HealthMetricsState = {
  daily: {
    steps: createDailyBucket(),
    water: createDailyBucket()
  }
};

const healthMetricsSlice = createSlice({
  name: 'healthMetrics',
  initialState,
  reducers: {
    fetchDailyMetricsRequested(
      state,
      action: PayloadAction<FetchDailyMetricsRequestedPayload>
    ) {
      const { metricType } = action.payload;
      state.daily[metricType].loading = true;
      state.daily[metricType].error = null;
    },
    fetchDailyMetricsSucceeded(
      state,
      action: PayloadAction<FetchDailyMetricsSucceededPayload>
    ) {
      const { metricType, range, items } = action.payload;
      state.daily[metricType].loading = false;
      state.daily[metricType].items = items;
      state.daily[metricType].loadedRange = range;
    },
    fetchDailyMetricsFailed(
      state,
      action: PayloadAction<{ metricType: HealthMetricType; message: string }>
    ) {
      const { metricType, message } = action.payload;
      state.daily[metricType].loading = false;
      state.daily[metricType].error = message;
    },
    clearDailyMetricsError(state, action: PayloadAction<HealthMetricType>) {
      state.daily[action.payload].error = null;
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
