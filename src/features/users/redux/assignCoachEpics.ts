import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  assignCoachRequested,
  assignCoachSucceeded,
  assignCoachFailed,
  type AssignCoachRequest,
  type AssignCoachResponse
} from './assignCoachSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import { usersListRequested } from './userListSlice';

export const assignCoachEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(assignCoachRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<AssignCoachRequest>).payload;
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${API_URL}/api/users/${payload.userId}/assign-coach`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                coachId: payload.coachId
              })
            }
          );

          if (res.status === 403) throw new Error('FORBIDDEN');

          if (!res.ok) {
            const message =
              (await res.text().catch(() => '')) || 'Failed to assign coach.';
            throw new Error(message);
          }

          return (await res.json()) as AssignCoachResponse;
        })()
      ).pipe(
        mergeMap((data) =>
          of(assignCoachSucceeded(data), usersListRequested())
        ),
        catchError((err: unknown) => {
          const msg =
            err instanceof Error && err.message === 'FORBIDDEN'
              ? 'You do not have permission to assign a coach.'
              : err instanceof Error && err.message === 'NOT_SIGNED_IN'
              ? 'You must be signed in.'
              : err instanceof Error
              ? err.message
              : 'Something went wrong while assigning the coach.';

          return of(assignCoachFailed(msg));
        })
      );
    })
  );
