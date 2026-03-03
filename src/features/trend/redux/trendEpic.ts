import { ofType, type Epic } from 'redux-observable';
import { EMPTY, from, of } from 'rxjs';
import { catchError, mergeMap, withLatestFrom } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  trendAnalyzeRequested,
  trendAnalyzeSucceeded,
  trendAnalyzeFailed,
  type TrendAnalyzeResponse,
  type TrendAnalyzeRequest,
  trendCache
} from './trendSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';

const trendAnalyzeEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$,
  state$
) =>
  action$.pipe(
    ofType(trendAnalyzeRequested.type),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const API_URL = import.meta.env.VITE_API_URL;

      const payload = (action as PayloadAction<TrendAnalyzeRequest>).payload;
      const { range, force = false } = payload;

      const trendState = state.trend;

      // If cached and not forcing, skip the network call
      if (!force && trendCache.isCacheValid(trendState, range)) {
        return EMPTY;
      }

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${API_URL}/api/trend/analyze`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ range })
          });

          if (!res.ok) {
            let message = `HTTP_${res.status}`;
            try {
              const json = await res.json();
              if (json?.error) message = json.error;
              else if (json?.message) message = json.message;
            } catch {
              try {
                const text = await res.text();
                if (text) message = text;
              } catch {
                // ignore
              }
            }
            throw new Error(message);
          }

          const data = (await res.json()) as TrendAnalyzeResponse;

          // normalize in case backend ever omits/mismatches range
          const normalized: TrendAnalyzeResponse = { ...data, range };
          return trendAnalyzeSucceeded(normalized);
        })()
      ).pipe(
        catchError((err) => {
          const msg =
            err?.message === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : err?.message ?? 'Failed to analyze trend';
          return of(trendAnalyzeFailed(msg));
        })
      );
    })
  );

export const trendEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  trendAnalyzeEpic
];
