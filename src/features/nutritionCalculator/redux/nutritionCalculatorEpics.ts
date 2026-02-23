import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import {
  persistUserProfileRequested,
  persistUserProfileSucceeded,
  persistUserProfileFailed,
  type UserProfileUpsertPayload,
  loadUserProfileRequested,
  loadUserProfileSucceeded,
  loadUserProfileFailed
} from './nutritionCalculatorSlice';

import type { PayloadAction } from '@reduxjs/toolkit';
import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import { fetchUserProfile } from '../helpers/fetchUserProfile';

export const persistUserProfileEpic: Epic = (action$) =>
  action$.pipe(
    ofType(persistUserProfileRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<UserProfileUpsertPayload>)
        .payload;

      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${API_URL}/api/users/current-user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (res.status === 403) throw new Error('NO_ACCESS');

          if (!res.ok) {
            const msg =
              (await res.text().catch(() => '')) || 'Failed to save profile.';
            throw new Error(msg);
          }
        })()
      ).pipe(
        mergeMap(() =>
          of(persistUserProfileSucceeded(), loadUserProfileRequested())
        ),
        catchError((err: unknown) => {
          const msg =
            err instanceof Error && err.message === 'NOT_SIGNED_IN'
              ? 'You must be signed in.'
              : err instanceof Error && err.message === 'NO_ACCESS'
              ? 'Your account does not have access.'
              : err instanceof Error
              ? err.message
              : 'Failed to save profile.';

          return of(persistUserProfileFailed(msg));
        })
      );
    })
  );

export const loadUserProfileEpic: Epic = (action$) =>
  action$.pipe(
    ofType(loadUserProfileRequested.type),
    mergeMap(() =>
      from(fetchUserProfile()).pipe(
        mergeMap((data) => of(loadUserProfileSucceeded(data))),
        catchError((err: unknown) => {
          const msg =
            err instanceof Error && err.message === 'NOT_SIGNED_IN'
              ? 'You must be signed in.'
              : err instanceof Error && err.message === 'NO_ACCESS'
              ? 'Your account does not have access.'
              : err instanceof Error
              ? err.message
              : 'Failed to load profile.';

          return of(loadUserProfileFailed(msg));
        })
      )
    )
  );

export const nutritionCalculatorEpics: Epic[] = [
  persistUserProfileEpic,
  loadUserProfileEpic
];
