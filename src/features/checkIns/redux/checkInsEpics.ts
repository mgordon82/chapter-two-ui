import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  fetchCheckInsRequested,
  fetchCheckInsSucceeded,
  fetchCheckInsFailed,
  createCheckInRequested,
  createCheckInSucceeded,
  createCheckInFailed,
  type CheckIn,
  type CreateCheckInInput
} from './checkInsSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';

import { loadUserProfileRequested } from '../../nutritionCalculator/redux/nutritionCalculatorSlice';

type GetCheckInsResponse = {
  ok: true;
  items: CheckIn[];
};

const fetchCheckInsEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(fetchCheckInsRequested.type),
    mergeMap(() => {
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${API_URL}/api/check-ins/current-user`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) {
            let message = `HTTP_${res.status}`;
            try {
              const json = await res.json();
              if (json?.message) message = json.message;
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

          const data = (await res.json()) as GetCheckInsResponse;
          return fetchCheckInsSucceeded(data.items);
        })()
      ).pipe(
        catchError((err) => {
          const msg =
            err?.message === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : err?.message ?? 'Failed to load check-ins';
          return of(fetchCheckInsFailed(msg));
        })
      );
    })
  );

const createCheckInEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(createCheckInRequested.type),
    mergeMap((action: PayloadAction<CreateCheckInInput>) => {
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${API_URL}/api/check-ins/current-user`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(action.payload)
          });

          if (!res.ok) {
            let message = `HTTP_${res.status}`;
            try {
              const json = await res.json();
              if (json?.message) message = json.message;
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

          const data = await res.json();

          return [
            createCheckInSucceeded({ id: String(data.id) }),
            fetchCheckInsRequested(),
            loadUserProfileRequested()
          ];
        })()
      ).pipe(
        mergeMap((actions) => from(actions)),
        catchError((err) => {
          const msg =
            err?.message === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : err?.message ?? 'Failed to create check-in';
          return of(createCheckInFailed(msg));
        })
      );
    })
  );

export const checkInsEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  fetchCheckInsEpic,
  createCheckInEpic
];
