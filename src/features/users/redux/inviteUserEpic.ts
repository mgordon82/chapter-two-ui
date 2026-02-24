import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  inviteUserRequested,
  inviteUserSucceeded,
  inviteUserFailed,
  type InviteUserRequest,
  type InviteUserResponse
} from './inviteUserSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';

export const inviteUserEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(inviteUserRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<InviteUserRequest>).payload;

      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${API_URL}/api/users/invite`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (res.status === 409) throw new Error('USER_EXISTS');
          if (res.status === 403) throw new Error('FORBIDDEN');

          if (!res.ok) {
            const message =
              (await res.text().catch(() => '')) || 'Invite failed.';
            throw new Error(message);
          }

          return (await res.json()) as InviteUserResponse;
        })()
      ).pipe(
        mergeMap((data) => of(inviteUserSucceeded(data))),
        catchError((err: unknown) => {
          const msg =
            err instanceof Error && err.message === 'USER_EXISTS'
              ? 'That user already exists.'
              : err instanceof Error && err.message === 'FORBIDDEN'
              ? 'Coach access required.'
              : err instanceof Error && err.message === 'NOT_SIGNED_IN'
              ? 'You must be signed in.'
              : err instanceof Error
              ? err.message
              : 'Something went wrong while inviting a user.';

          return of(inviteUserFailed(msg));
        })
      );
    })
  );
