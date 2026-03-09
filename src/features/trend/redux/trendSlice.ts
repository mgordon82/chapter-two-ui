import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TrendRange = '1W' | '1M' | '3M' | '6M' | '12M';

export type TrendStatus = 'ok' | 'insufficient_data';
export type TrendConfidence = 'low' | 'medium' | 'high';

export type TrendOption = {
  id: string;
  kind: 'hold' | 'activity_bump' | 'macro_tweak';
  title: string;
  summary: string;
};

export type TrendAiRecommendation = {
  id: string;
  title: string;
  summary: string;
  rationale: string;
};

export type TrendAi = {
  quickRead: string;
  context: string | null;
  disclaimer: string | null;
  recommended: TrendAiRecommendation[];
};

export type TrendMetricsResponse = {
  requestId: string;
  range: TrendRange;
  status: TrendStatus;
  confidence: TrendConfidence;
  series: { date: string; weightKg: number }[];
  windows: null | {
    last7: { start: string; end: string; n: number };
    prev7: { start: string; end: string; n: number };
  };
  metrics: {
    currentWeightKg: number | null;
    avgLast7dKg: number | null;
    avgPrev7dKg: number | null;
    avgChangePerWeekKg: number | null;
    avgChangePerWeekPct: number | null;
  };
};

export type TrendInsightResponse = {
  requestId: string;
  range: TrendRange;
  status: TrendStatus;
  confidence: TrendConfidence;
  options: TrendOption[];
  ai: TrendAi | null;
};

export type TrendMetricsRequest = {
  range: TrendRange;
  force?: boolean;
};

export type TrendInsightRequest = {
  range: TrendRange;
  force?: boolean;
};

type TrendResourceState<T> = {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  data: T | null;
  cachedAt: string | null;
};

export type TrendState = {
  range: TrendRange;
  cacheTtlMs: number;
  metrics: TrendResourceState<TrendMetricsResponse>;
  insight: TrendResourceState<TrendInsightResponse>;
};

const createResourceState = <T>(): TrendResourceState<T> => ({
  status: 'idle',
  error: null,
  data: null,
  cachedAt: null
});

const initialState: TrendState = {
  range: '3M',
  cacheTtlMs: 1000 * 60 * 60, // 1 hour
  metrics: createResourceState<TrendMetricsResponse>(),
  insight: createResourceState<TrendInsightResponse>()
};

const isResourceCacheValid = <T extends { range: TrendRange }>(
  resource: TrendResourceState<T>,
  range: TrendRange,
  cacheTtlMs: number
) => {
  if (!resource.data) return false;
  if (resource.data.range !== range) return false;
  if (!resource.cachedAt) return false;

  const cachedAtMs = new Date(resource.cachedAt).getTime();
  if (!Number.isFinite(cachedAtMs)) return false;

  return Date.now() - cachedAtMs < cacheTtlMs;
};

const trendSlice = createSlice({
  name: 'trend',
  initialState,
  reducers: {
    trendMetricsRequested(state, action: PayloadAction<TrendMetricsRequest>) {
      const { range, force = false } = action.payload;
      state.range = range;
      state.metrics.error = null;

      if (
        !force &&
        isResourceCacheValid(state.metrics, range, state.cacheTtlMs)
      ) {
        state.metrics.status = 'succeeded';
        return;
      }

      state.metrics.status = 'loading';
    },

    trendMetricsSucceeded(state, action: PayloadAction<TrendMetricsResponse>) {
      state.range = action.payload.range;
      state.metrics.status = 'succeeded';
      state.metrics.error = null;
      state.metrics.data = action.payload;
      state.metrics.cachedAt = new Date().toISOString();
    },

    trendMetricsFailed(state, action: PayloadAction<string>) {
      state.metrics.status = 'failed';
      state.metrics.error = action.payload;
    },

    trendInsightRequested(state, action: PayloadAction<TrendInsightRequest>) {
      const { range, force = false } = action.payload;
      state.range = range;
      state.insight.error = null;

      if (
        !force &&
        isResourceCacheValid(state.insight, range, state.cacheTtlMs)
      ) {
        state.insight.status = 'succeeded';
        return;
      }

      state.insight.status = 'loading';
    },

    trendInsightSucceeded(state, action: PayloadAction<TrendInsightResponse>) {
      state.range = action.payload.range;
      state.insight.status = 'succeeded';
      state.insight.error = null;
      state.insight.data = action.payload;
      state.insight.cachedAt = new Date().toISOString();
    },

    trendInsightFailed(state, action: PayloadAction<string>) {
      state.insight.status = 'failed';
      state.insight.error = action.payload;
    },

    trendReset(state) {
      state.range = '3M';
      state.metrics = createResourceState<TrendMetricsResponse>();
      state.insight = createResourceState<TrendInsightResponse>();
    },

    trendCacheTtlUpdated(state, action: PayloadAction<number>) {
      const ttl = action.payload;
      if (Number.isFinite(ttl) && ttl >= 0) {
        state.cacheTtlMs = ttl;
      }
    },

    trendMetricsCacheCleared(state) {
      state.metrics.data = null;
      state.metrics.cachedAt = null;
      state.metrics.error = null;
      if (state.metrics.status === 'succeeded') {
        state.metrics.status = 'idle';
      }
    },

    trendInsightCacheCleared(state) {
      state.insight.data = null;
      state.insight.cachedAt = null;
      state.insight.error = null;
      if (state.insight.status === 'succeeded') {
        state.insight.status = 'idle';
      }
    },

    trendCacheCleared(state) {
      state.metrics.data = null;
      state.metrics.cachedAt = null;
      state.metrics.error = null;
      state.insight.data = null;
      state.insight.cachedAt = null;
      state.insight.error = null;

      if (state.metrics.status === 'succeeded') {
        state.metrics.status = 'idle';
      }
      if (state.insight.status === 'succeeded') {
        state.insight.status = 'idle';
      }
    }
  }
});

export const {
  trendMetricsRequested,
  trendMetricsSucceeded,
  trendMetricsFailed,
  trendInsightRequested,
  trendInsightSucceeded,
  trendInsightFailed,
  trendReset,
  trendCacheTtlUpdated,
  trendMetricsCacheCleared,
  trendInsightCacheCleared,
  trendCacheCleared
} = trendSlice.actions;

export default trendSlice.reducer;

export const trendCache = {
  isMetricsCacheValid: (state: TrendState, range: TrendRange): boolean =>
    isResourceCacheValid(state.metrics, range, state.cacheTtlMs),

  isInsightCacheValid: (state: TrendState, range: TrendRange): boolean =>
    isResourceCacheValid(state.insight, range, state.cacheTtlMs)
};
