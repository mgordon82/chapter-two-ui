import { ofType, type Epic } from 'redux-observable';
import { EMPTY, from, of } from 'rxjs';
import { catchError, mergeMap, withLatestFrom } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  trendMetricsRequested,
  trendMetricsSucceeded,
  trendMetricsFailed,
  trendInsightRequested,
  trendInsightSucceeded,
  trendInsightFailed,
  type TrendMetricsRequest,
  type TrendMetricsResponse,
  type TrendInsightRequest,
  type TrendInsightResponse,
  trendCache
} from './trendSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';

const getErrorMessage = (err: unknown, fallback: string) => {
  const message =
    typeof err === 'object' && err && 'message' in err
      ? (err as { message?: string }).message
      : null;

  if (message === 'NOT_SIGNED_IN') return 'Please sign in again.';
  return message ?? fallback;
};

const parseErrorMessage = async (res: Response) => {
  const message = `HTTP_${res.status}`;

  try {
    const json = await res.json();
    if (json?.error) return json.error as string;
    if (json?.message) return json.message as string;
  } catch {
    // ignore
  }

  try {
    const text = await res.text();
    if (text) return text;
  } catch {
    // ignore
  }

  return message;
};

const fetchTrendMetrics = async (
  apiUrl: string,
  range: TrendMetricsRequest['range']
): Promise<TrendMetricsResponse> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_SIGNED_IN');

  const res = await fetch(`${apiUrl}/api/trend/metrics`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ range })
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }

  const data = (await res.json()) as TrendMetricsResponse;
  return { ...data, range };
};

const fetchTrendInsight = async (
  apiUrl: string,
  range: TrendInsightRequest['range']
): Promise<TrendInsightResponse> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_SIGNED_IN');

  const res = await fetch(`${apiUrl}/api/trend/insight`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ range })
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res));
  }

  const data = (await res.json()) as TrendInsightResponse;
  return { ...data, range };
};

const trendMetricsEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$,
  state$
) =>
  action$.pipe(
    ofType(trendMetricsRequested.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const API_URL = import.meta.env.VITE_API_URL;
      const payload = (action as PayloadAction<TrendMetricsRequest>).payload;
      const { range, force = false } = payload;

      if (!force && trendCache.isMetricsCacheValid(state.trend, range)) {
        return EMPTY;
      }

      return from(fetchTrendMetrics(API_URL, range)).pipe(
        mergeMap((data) => of(trendMetricsSucceeded(data))),
        catchError((err) =>
          of(
            trendMetricsFailed(getErrorMessage(err, 'Failed to analyze trend'))
          )
        )
      );
    })
  );

const trendInsightEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$,
  state$
) =>
  action$.pipe(
    ofType(trendInsightRequested.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const API_URL = import.meta.env.VITE_API_URL;
      const payload = (action as PayloadAction<TrendInsightRequest>).payload;
      const { range, force = false } = payload;

      if (!force && trendCache.isInsightCacheValid(state.trend, range)) {
        return EMPTY;
      }

      return from(
        (async (): Promise<AnyAction[]> => {
          const actions: AnyAction[] = [];

          const hasValidMetricsCache = trendCache.isMetricsCacheValid(
            state.trend,
            range
          );

          if (!hasValidMetricsCache) {
            const metrics = await fetchTrendMetrics(API_URL, range);
            actions.push(trendMetricsSucceeded(metrics));
          }

          const insight = await fetchTrendInsight(API_URL, range);
          actions.push(trendInsightSucceeded(insight));

          return actions;
        })()
      ).pipe(
        mergeMap((actions) => from(actions)),
        catchError((err) =>
          of(
            trendInsightFailed(
              getErrorMessage(err, 'Failed to generate trend insight')
            )
          )
        )
      );
    })
  );

export const trendEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  trendMetricsEpic,
  trendInsightEpic
];
