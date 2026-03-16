import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';

import {
  clientProfileRequested,
  clientProfileSucceeded,
  clientProfileFailed
} from './clientProfileSlice';

import type { ClientProfile } from '../types';

export const clientProfileEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(clientProfileRequested.type),
    mergeMap((action: AnyAction) => {
      const { userId } = action.payload;

      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${API_URL}/api/clients/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });

          if (res.status === 403) throw new Error('FORBIDDEN');

          if (!res.ok) {
            const message =
              (await res.text().catch(() => '')) ||
              'Failed to load client profile.';
            throw new Error(message);
          }

          return (await res.json()) as ClientProfile;
        })()
      ).pipe(
        mergeMap((data) => of(clientProfileSucceeded(data))),
        catchError((err: unknown) => {
          const msg =
            err instanceof Error && err.message === 'FORBIDDEN'
              ? 'You do not have permission to view this client.'
              : err instanceof Error && err.message === 'NOT_SIGNED_IN'
              ? 'You must be signed in.'
              : err instanceof Error
              ? err.message
              : 'Something went wrong while loading the client profile.';

          return of(clientProfileFailed(msg));
        })
      );
    })
  );

export const clientProfileEpics = [clientProfileEpic];
