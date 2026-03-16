import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import {
  manageUserRolesRequested,
  manageUserRolesSucceeded,
  manageUserRolesFailed,
  type ManageUserRolesRequest,
  type ManageUserRolesResponse
} from './manageUserRolesSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import { usersListRequested } from './userListSlice';

export const manageUserRolesEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(manageUserRolesRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<ManageUserRolesRequest>).payload;
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${API_URL}/api/users/${payload.userId}/roles`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                roles: payload.roles
              })
            }
          );

          if (res.status === 403) throw new Error('FORBIDDEN');

          if (!res.ok) {
            const message =
              (await res.text().catch(() => '')) ||
              'Failed to update user roles.';
            throw new Error(message);
          }

          return (await res.json()) as ManageUserRolesResponse;
        })()
      ).pipe(
        mergeMap((data) =>
          of(manageUserRolesSucceeded(data), usersListRequested())
        ),
        catchError((err: unknown) => {
          const msg =
            err instanceof Error && err.message === 'FORBIDDEN'
              ? 'You do not have permission to manage roles.'
              : err instanceof Error && err.message === 'NOT_SIGNED_IN'
              ? 'You must be signed in.'
              : err instanceof Error
              ? err.message
              : 'Something went wrong while updating roles.';

          return of(manageUserRolesFailed(msg));
        })
      );
    })
  );
