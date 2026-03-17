import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import type { AnyAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store';
import { getAccessToken } from '../../../auth/helpers/getAccessToken';

import {
  fetchDailyMetricsRequested,
  fetchDailyMetricsSucceeded,
  fetchDailyMetricsFailed,
  type HealthMetricDailyItem,
  type HealthMetricType,
  type HealthMetricRange
} from './healthMetricsSlice';

const readErrorMessage = async (response: Response) => {
  let message = `HTTP_${response.status}`;

  try {
    const json = await response.json();
    if (json?.message) message = json.message;
  } catch {
    try {
      const text = await response.text();
      if (text) message = text;
    } catch {
      // ignore
    }
  }

  return message;
};

const fetchDailyMetricsEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(fetchDailyMetricsRequested.type),
    mergeMap((action: ReturnType<typeof fetchDailyMetricsRequested>) => {
      const { metricType, range } = action.payload;

      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const accessToken = await getAccessToken();
          if (!accessToken) throw new Error('NOT_SIGNED_IN');

          const response = await fetch(
            `${API_URL}/api/health-metrics/current-user/daily?metricType=${encodeURIComponent(
              metricType
            )}&range=${encodeURIComponent(range)}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          if (!response.ok) {
            throw new Error(await readErrorMessage(response));
          }

          const data = (await response.json()) as {
            ok: true;
            metricType: HealthMetricType;
            range: HealthMetricRange;
            items: HealthMetricDailyItem[];
          };

          return fetchDailyMetricsSucceeded({
            metricType: data.metricType,
            range: data.range,
            items: data.items
          });
        })()
      ).pipe(
        catchError((err) => {
          const msg =
            err?.message === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : err?.message ?? 'Failed to fetch health metrics';

          return of(
            fetchDailyMetricsFailed({
              metricType,
              message: msg
            })
          );
        })
      );
    })
  );

export const healthMetricsEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  fetchDailyMetricsEpic
];
