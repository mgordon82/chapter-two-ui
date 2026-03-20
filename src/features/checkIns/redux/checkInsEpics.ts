import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  fetchCheckInsRequested,
  fetchCheckInsSucceeded,
  fetchCheckInsFailed,
  fetchCheckInByDateRequested,
  fetchCheckInByDateSucceeded,
  fetchCheckInByDateFailed,
  createCheckInRequested,
  createCheckInSucceeded,
  createCheckInFailed,
  closeCheckInRequested,
  closeCheckInSucceeded,
  closeCheckInFailed,
  reopenCheckInRequested,
  reopenCheckInSucceeded,
  reopenCheckInFailed,
  saveExerciseSelectionRequested,
  saveExerciseSelectionSucceeded,
  saveExerciseSelectionFailed,
  type MappedCheckIn,
  type MappedExerciseSession,
  type CreateCheckInInput,
  type SaveExerciseSelectionInput
} from './checkInsSlice';

import type { RangeKey } from '../types';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';

import { loadUserProfileRequested } from '../../nutritionCalculator/redux/nutritionCalculatorSlice';
import {
  trendMetricsRequested,
  trendInsightCacheCleared
} from '../../trend/redux/trendSlice';

type GetCheckInsResponse = {
  ok: true;
  items: unknown[];
  mappedItems: MappedCheckIn[];
};

type GetCheckInByDateResponse = {
  ok: true;
  item: unknown | null;
  mappedItem: MappedCheckIn | null;
  suggestedExerciseSessions?: unknown[];
  mappedSuggestedExerciseSessions?: MappedExerciseSession[];
};

type CreateCheckInResponse = {
  ok?: boolean;
  id: string;
  action?: 'created' | 'updated';
  item?: unknown;
  mappedItem?: MappedCheckIn | null;
  lifecycleState?: 'open' | 'closed' | 'expired' | null;
  isEditable?: boolean;
};

type LifecycleResponse = {
  ok: true;
  status: 'open' | 'closed';
  item?: unknown;
  mappedItem?: MappedCheckIn | null;
};

type SaveExerciseSelectionResponse = {
  ok: true;
  item?: unknown;
  mappedItem?: MappedCheckIn | null;
};

type ApiErrorResponse = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  return fallback;
};

const readErrorMessageFromResponse = async (res: Response) => {
  let message = `HTTP_${res.status}`;

  try {
    const json = (await res.json()) as ApiErrorResponse;
    if (json?.message) {
      message = json.message;
    }
  } catch {
    try {
      const text = await res.text();
      if (text) {
        message = text;
      }
    } catch {
      // ignore
    }
  }

  return message;
};

const fetchCheckInsEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(fetchCheckInsRequested.type),
    mergeMap((action: PayloadAction<{ range: RangeKey }>) => {
      const API_URL = import.meta.env.VITE_API_URL;
      const { range } = action.payload;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const params = new URLSearchParams({ range });

          const res = await fetch(
            `${API_URL}/api/check-ins/current-user?${params.toString()}`,
            {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (!res.ok) {
            throw new Error(await readErrorMessageFromResponse(res));
          }

          const data = (await res.json()) as GetCheckInsResponse;

          return fetchCheckInsSucceeded({
            items: Array.isArray(data.mappedItems) ? data.mappedItems : [],
            range
          });
        })()
      ).pipe(
        catchError((err: unknown) => {
          const rawMessage = getErrorMessage(err, 'Failed to load check-ins');
          const msg =
            rawMessage === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : rawMessage;

          return of(fetchCheckInsFailed(msg));
        })
      );
    })
  );

const fetchCheckInByDateEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(fetchCheckInByDateRequested.type),
    mergeMap((action: PayloadAction<{ date: string }>) => {
      const API_URL = import.meta.env.VITE_API_URL;
      const { date } = action.payload;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const params = new URLSearchParams({ date });

          const res = await fetch(
            `${API_URL}/api/check-ins/current-user/by-date?${params.toString()}`,
            {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (!res.ok) {
            throw new Error(await readErrorMessageFromResponse(res));
          }

          const data = (await res.json()) as GetCheckInByDateResponse;

          return fetchCheckInByDateSucceeded({
            date,
            item: data.mappedItem ?? null,
            suggestedExerciseSessions: Array.isArray(
              data.mappedSuggestedExerciseSessions
            )
              ? data.mappedSuggestedExerciseSessions
              : []
          });
        })()
      ).pipe(
        catchError((err: unknown) => {
          const rawMessage = getErrorMessage(
            err,
            'Failed to load check-in for date'
          );
          const msg =
            rawMessage === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : rawMessage;

          return of(
            fetchCheckInByDateFailed({
              date,
              message: msg
            })
          );
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
            throw new Error(await readErrorMessageFromResponse(res));
          }

          const data = (await res.json()) as CreateCheckInResponse;

          const followUpActions: AnyAction[] = [
            createCheckInSucceeded({ id: String(data.id) }),
            fetchCheckInsRequested({ range: '3M' }),
            loadUserProfileRequested(),
            trendInsightCacheCleared(),
            trendMetricsRequested({ range: '3M', force: true })
          ];

          const followUpDate =
            data.mappedItem?.representedDate ?? action.payload.representedDate;

          if (followUpDate) {
            followUpActions.push(
              fetchCheckInByDateRequested({ date: followUpDate })
            );
          }

          return followUpActions;
        })()
      ).pipe(
        mergeMap((actions) => from(actions)),
        catchError((err: unknown) => {
          const rawMessage = getErrorMessage(err, 'Failed to create check-in');
          const msg =
            rawMessage === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : rawMessage;

          return of(createCheckInFailed(msg));
        })
      );
    })
  );

const closeCheckInEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(closeCheckInRequested.type),
    mergeMap((action: PayloadAction<{ id: string }>) => {
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${API_URL}/api/check-ins/current-user/${action.payload.id}/close`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (!res.ok) {
            throw new Error(await readErrorMessageFromResponse(res));
          }

          await (res.json() as Promise<LifecycleResponse>);

          const followUpActions: AnyAction[] = [
            closeCheckInSucceeded(),
            fetchCheckInsRequested({ range: '3M' }),
            trendInsightCacheCleared(),
            trendMetricsRequested({ range: '3M', force: true })
          ];

          return followUpActions;
        })()
      ).pipe(
        mergeMap((actions) => from(actions)),
        catchError((err: unknown) => {
          const rawMessage = getErrorMessage(err, 'Failed to close check-in');
          const msg =
            rawMessage === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : rawMessage;

          return of(closeCheckInFailed(msg));
        })
      );
    })
  );

const reopenCheckInEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(reopenCheckInRequested.type),
    mergeMap((action: PayloadAction<{ id: string }>) => {
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${API_URL}/api/check-ins/current-user/${action.payload.id}/reopen`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (!res.ok) {
            throw new Error(await readErrorMessageFromResponse(res));
          }

          await (res.json() as Promise<LifecycleResponse>);

          const followUpActions: AnyAction[] = [
            reopenCheckInSucceeded(),
            fetchCheckInsRequested({ range: '3M' }),
            trendInsightCacheCleared(),
            trendMetricsRequested({ range: '3M', force: true })
          ];

          return followUpActions;
        })()
      ).pipe(
        mergeMap((actions) => from(actions)),
        catchError((err: unknown) => {
          const rawMessage = getErrorMessage(err, 'Failed to reopen check-in');
          const msg =
            rawMessage === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : rawMessage;

          return of(reopenCheckInFailed(msg));
        })
      );
    })
  );

const saveExerciseSelectionEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(saveExerciseSelectionRequested.type),
    mergeMap((action: PayloadAction<SaveExerciseSelectionInput>) => {
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const {
            id,
            autoSuggestedExerciseSessionIds,
            includedExerciseSessionIds,
            excludedExerciseSessionIds
          } = action.payload;

          const res = await fetch(
            `${API_URL}/api/check-ins/current-user/${id}/exercise-selection`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                autoSuggestedExerciseSessionIds,
                includedExerciseSessionIds,
                excludedExerciseSessionIds
              })
            }
          );

          if (!res.ok) {
            throw new Error(await readErrorMessageFromResponse(res));
          }

          await (res.json() as Promise<SaveExerciseSelectionResponse>);

          const followUpActions: AnyAction[] = [
            saveExerciseSelectionSucceeded(),
            fetchCheckInsRequested({ range: '3M' }),
            trendInsightCacheCleared(),
            trendMetricsRequested({ range: '3M', force: true })
          ];

          return followUpActions;
        })()
      ).pipe(
        mergeMap((actions) => from(actions)),
        catchError((err: unknown) => {
          const rawMessage = getErrorMessage(
            err,
            'Failed to save exercise selection'
          );
          const msg =
            rawMessage === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : rawMessage;

          return of(saveExerciseSelectionFailed(msg));
        })
      );
    })
  );

export const checkInsEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  fetchCheckInsEpic,
  fetchCheckInByDateEpic,
  createCheckInEpic,
  closeCheckInEpic,
  reopenCheckInEpic,
  saveExerciseSelectionEpic
];
