import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import type { PayloadAction, AnyAction } from '@reduxjs/toolkit';

import type { RootState } from '../../../app/store';

import {
  fetchStarterPhotosRequested,
  fetchStarterPhotosSucceeded,
  fetchStarterPhotosFailed,
  createStarterUploadSessionRequested,
  createStarterUploadSessionSucceeded,
  createStarterUploadSessionFailed,
  createProgressUploadSessionRequested,
  createProgressUploadSessionSucceeded,
  createProgressUploadSessionFailed,
  finalizeProgressPhotosRequested,
  finalizeProgressPhotosSucceeded,
  finalizeProgressPhotosFailed,
  type ProgressUploadSessionPayload,
  type FinalizeProgressPhotosPayload,
  finalizeStarterPhotosRequested,
  finalizeStarterPhotosSucceeded,
  finalizeStarterPhotosFailed,
  type StarterUploadSessionPayload,
  type FinalizeStarterPhotosPayload
} from './photosSlice';

import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import { fetchCheckInsRequested } from '../../checkIns/redux/checkInsSlice';

const getApiUrl = () => import.meta.env.VITE_API_URL;

const fetchStarterPhotosEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(fetchStarterPhotosRequested.type),
    mergeMap(() =>
      from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(`${getApiUrl()}/api/photos/starter`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.message || 'Failed to fetch starter photos');
          }

          return data;
        })()
      ).pipe(
        mergeMap((data) =>
          of(
            fetchStarterPhotosSucceeded({
              hasStarterPhotos: Boolean(data?.hasStarterPhotos),
              photoSet:
                data?.hasStarterPhotos && data?.photoSet
                  ? {
                      id: String(data.photoSet.id),
                      photos: Array.isArray(data.photoSet.photos)
                        ? data.photoSet.photos
                        : []
                    }
                  : null
            })
          )
        ),
        catchError((err: unknown) =>
          of(
            fetchStarterPhotosFailed(
              err instanceof Error
                ? err.message
                : 'Failed to fetch starter photos'
            )
          )
        )
      )
    )
  );

const createStarterUploadSessionEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(createStarterUploadSessionRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<StarterUploadSessionPayload>)
        .payload;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${getApiUrl()}/api/photos/starter/upload-session`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data?.message || 'Failed to create starter upload session'
            );
          }

          return data;
        })()
      ).pipe(
        mergeMap((data) =>
          of(
            createStarterUploadSessionSucceeded({
              photoSetId: String(data.photoSetId),
              uploads: Array.isArray(data.uploads) ? data.uploads : []
            })
          )
        ),
        catchError((err: unknown) =>
          of(
            createStarterUploadSessionFailed(
              err instanceof Error
                ? err.message
                : 'Failed to create starter upload session'
            )
          )
        )
      );
    })
  );

const createProgressUploadSessionEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(createProgressUploadSessionRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<ProgressUploadSessionPayload>)
        .payload;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${getApiUrl()}/api/photos/progress/upload-session`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data?.message || 'Failed to create progress upload session'
            );
          }

          return data;
        })()
      ).pipe(
        mergeMap((data) =>
          of(
            createProgressUploadSessionSucceeded({
              checkInId: String(data.checkInId),
              uploads: Array.isArray(data.uploads) ? data.uploads : []
            })
          )
        ),
        catchError((err: unknown) =>
          of(
            createProgressUploadSessionFailed(
              err instanceof Error
                ? err.message
                : 'Failed to create progress upload session'
            )
          )
        )
      );
    })
  );

const finalizeStarterPhotosEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(finalizeStarterPhotosRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<FinalizeStarterPhotosPayload>)
        .payload;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${getApiUrl()}/api/photos/starter/finalize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data?.message || 'Failed to finalize starter photos'
            );
          }

          return data;
        })()
      ).pipe(
        mergeMap((data) =>
          of(
            finalizeStarterPhotosSucceeded({
              id: String(data.photoSet.id),
              photos: Array.isArray(data.photoSet?.photos)
                ? data.photoSet.photos
                : []
            })
          )
        ),
        catchError((err: unknown) =>
          of(
            finalizeStarterPhotosFailed(
              err instanceof Error
                ? err.message
                : 'Failed to finalize starter photos'
            )
          )
        )
      );
    })
  );

const finalizeProgressPhotosEpic: Epic<AnyAction, AnyAction, RootState> = (
  action$
) =>
  action$.pipe(
    ofType(finalizeProgressPhotosRequested.type),
    mergeMap((action) => {
      const payload = (action as PayloadAction<FinalizeProgressPhotosPayload>)
        .payload;

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) throw new Error('NOT_SIGNED_IN');

          const res = await fetch(
            `${getApiUrl()}/api/photos/progress/finalize`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(
              data?.message || 'Failed to finalize progress photos'
            );
          }

          return data;
        })()
      ).pipe(
        mergeMap(() =>
          from([finalizeProgressPhotosSucceeded(), fetchCheckInsRequested()])
        ),
        catchError((err: unknown) =>
          of(
            finalizeProgressPhotosFailed(
              err instanceof Error
                ? err.message
                : 'Failed to finalize progress photos'
            )
          )
        )
      );
    })
  );

export const photosEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  fetchStarterPhotosEpic,
  createStarterUploadSessionEpic,
  finalizeStarterPhotosEpic,
  createProgressUploadSessionEpic,
  finalizeProgressPhotosEpic
];
