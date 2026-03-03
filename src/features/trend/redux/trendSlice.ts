import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type TrendRange = '1W' | '1M' | '3M' | '6M' | '12M';

export type TrendAnalyzeResponse = {
  requestId: string;
  range: TrendRange;
  status: 'ok' | 'insufficient_data';
  confidence: 'low' | 'medium' | 'high';
  series: { date: string; weightKg: number }[];

  windows: null | {
    last7: { start: string; end: string; n: number };
    prev7: { start: string; end: string; n: number };
  };
  ai?: {
    quickRead: string;
    context: string | null;
    disclaimer: string | null;
    recommended: Array<{
      id: string;
      title: string;
      summary: string;
      rationale: string;
    }>;
  };

  metrics: {
    currentWeightKg: number | null;
    avgLast7dKg: number | null;
    avgPrev7dKg: number | null;
    avgChangePerWeekKg: number | null;
    avgChangePerWeekPct: number | null;
  };
  options: Array<{
    id: string;
    kind: 'hold' | 'activity_bump' | 'macro_tweak';
    title: string;
    summary: string;
  }>;
};

export type TrendAnalyzeRequest = {
  range: TrendRange;
  /** bypass cache and re-run analysis */
  force?: boolean;
};

type TrendState = {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  data: TrendAnalyzeResponse | null;

  // currently-selected range
  range: TrendRange;

  // cache metadata
  cachedAt: string | null; // ISO timestamp when data was last fetched
  cacheTtlMs: number; // how long cached data is valid
};

const initialState: TrendState = {
  status: 'idle',
  error: null,
  data: null,
  range: '3M',

  cachedAt: null,
  cacheTtlMs: 1000 * 60 * 60 // 1 hour
};

const isCacheValid = (state: TrendState, range: TrendRange) => {
  if (!state.data) return false;
  if (state.data.range !== range) return false;
  if (!state.cachedAt) return false;

  const cachedAtMs = new Date(state.cachedAt).getTime();
  if (!Number.isFinite(cachedAtMs)) return false;

  return Date.now() - cachedAtMs < state.cacheTtlMs;
};

const trendSlice = createSlice({
  name: 'trend',
  initialState,
  reducers: {
    trendAnalyzeRequested(state, action: PayloadAction<TrendAnalyzeRequest>) {
      const { range, force = false } = action.payload;

      state.range = range;
      state.error = null;

      // If we already have a valid cached result for this range and we're not forcing,
      // keep status as succeeded to avoid UI flicker. Epic will also skip network.
      if (!force && isCacheValid(state, range)) {
        state.status = 'succeeded';
        return;
      }

      state.status = 'loading';
    },

    trendAnalyzeSucceeded(state, action: PayloadAction<TrendAnalyzeResponse>) {
      state.status = 'succeeded';
      state.data = action.payload;
      state.error = null;

      // cache timestamp
      state.cachedAt = new Date().toISOString();

      // keep range in sync with response
      state.range = action.payload.range;
    },

    trendAnalyzeFailed(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },

    trendReset(state) {
      state.status = 'idle';
      state.error = null;
      state.data = null;
      state.cachedAt = null;
      // keep range as-is
    },

    // Optional: allow you to change TTL later if you want
    trendCacheTtlUpdated(state, action: PayloadAction<number>) {
      const ttl = action.payload;
      if (Number.isFinite(ttl) && ttl >= 0) state.cacheTtlMs = ttl;
    },

    // Optional: allow manual cache clear without resetting range
    trendCacheCleared(state) {
      state.data = null;
      state.cachedAt = null;
      if (state.status === 'succeeded') state.status = 'idle';
    }
  }
});

export const {
  trendAnalyzeRequested,
  trendAnalyzeSucceeded,
  trendAnalyzeFailed,
  trendReset,
  trendCacheTtlUpdated,
  trendCacheCleared
} = trendSlice.actions;

export default trendSlice.reducer;

// Export helper for epic (and anywhere else)
export const trendCache = {
  isCacheValid
};
