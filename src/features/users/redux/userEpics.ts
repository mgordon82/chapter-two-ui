import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import {
  usersListFailed,
  usersListRequested,
  usersListSucceeded,
  type UsersListResponse
} from './userListSlice';

export const usersListEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(usersListRequested.type),
    mergeMap(() => {
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${API_URL}/api/users`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });

          if (res.status === 403) throw new Error('FORBIDDEN');

          if (!res.ok) {
            const message =
              (await res.text().catch(() => '')) || 'Failed to load users.';
            throw new Error(message);
          }

          return (await res.json()) as UsersListResponse;
        })()
      ).pipe(
        mergeMap((data) => of(usersListSucceeded(data))),
        catchError((err: unknown) => {
          const msg =
            err instanceof Error && err.message === 'FORBIDDEN'
              ? 'You do not have permission to view users.'
              : err instanceof Error && err.message === 'NOT_SIGNED_IN'
              ? 'You must be signed in.'
              : err instanceof Error
              ? err.message
              : 'Something went wrong while loading users.';

          return of(usersListFailed(msg));
        })
      );
    })
  );

export const userEpics = [usersListEpic];
