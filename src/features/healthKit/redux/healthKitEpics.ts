import { Capacitor } from '@capacitor/core';
import { ofType, type Epic } from 'redux-observable';
import { from, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import { HealthKit } from '../../../plugins/healthKit';
import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import { fetchCheckInsRequested } from '../../checkIns/redux/checkInsSlice';

import {
  healthKitSyncRequested,
  healthKitSyncSucceeded,
  healthKitSyncFailed
} from './healthKitSlice';

const healthKitSyncEpic: Epic<AnyAction, AnyAction, RootState> = (action$) =>
  action$.pipe(
    ofType(healthKitSyncRequested.type),
    mergeMap(() => {
      const API_URL = import.meta.env.VITE_API_URL;

      return from(
        (async () => {
          if (!Capacitor.isNativePlatform()) {
            throw new Error('Apple Health is only available in the iOS app.');
          }

          const permissionResult = await HealthKit.requestHealthPermissions();

          if (!permissionResult.granted) {
            throw new Error('Apple Health permission was not granted.');
          }

          const accessToken = await getAccessToken();
          if (!accessToken) throw new Error('NOT_SIGNED_IN');

          const integrationRes = await fetch(
            `${API_URL}/api/check-ins/current-user/integrations/apple-health`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          if (!integrationRes.ok) {
            let message = `HTTP_${integrationRes.status}`;
            try {
              const json = await integrationRes.json();
              if (json?.message) message = json.message;
            } catch {
              try {
                const text = await integrationRes.text();
                if (text) message = text;
              } catch {
                // ignore
              }
            }
            throw new Error(message);
          }

          const integrationData = (await integrationRes.json()) as {
            ok: true;
            integration: {
              lastSync?: {
                weightRecordedAt?: string | null;
              } | null;
            } | null;
          };

          const lastWeightRecordedAt =
            integrationData?.integration?.lastSync?.weightRecordedAt ?? null;

          let nextStartDate: string;

          if (lastWeightRecordedAt) {
            const lastDate = new Date(lastWeightRecordedAt);
            nextStartDate = new Date(lastDate.getTime() + 1000).toISOString();
          } else {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            nextStartDate = oneYearAgo.toISOString();
          }

          const weightSamples = await HealthKit.getWeightSamples({
            startDate: nextStartDate,
            limit: 500
          });

          let createdCount = 0;
          let duplicateCount = 0;
          let conflictCount = 0;

          for (const sample of weightSamples.items) {
            const response = await fetch(
              `${API_URL}/api/check-ins/current-user/import/apple-health/weight`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  externalSampleId: sample.sampleId,
                  recordedAt: sample.recordedAt,
                  metrics: {
                    weightKg: sample.valueKg
                  },
                  source: {
                    appSourceName: sample.source.appSourceName,
                    deviceSourceName: sample.source.deviceSourceName
                  }
                })
              }
            );

            if (!response.ok) {
              let message = `HTTP_${response.status}`;
              try {
                const json = await response.json();
                if (json?.message) message = json.message;
              } catch {
                try {
                  const text = await response.text();
                  if (text) message = text;
                } catch {
                  // ignore
                }
              }
              throw new Error(message);
            }

            const data = (await response.json()) as {
              ok: true;
              status?: 'created' | 'duplicate' | 'conflict_existing_checkin';
            };

            if (data?.status === 'created') createdCount += 1;
            else if (data?.status === 'duplicate') duplicateCount += 1;
            else if (data?.status === 'conflict_existing_checkin')
              conflictCount += 1;
          }

          return [
            healthKitSyncSucceeded({
              total: weightSamples.items.length,
              createdCount,
              duplicateCount,
              conflictCount
            }),
            fetchCheckInsRequested({ range: '3M' })
          ];
        })()
      ).pipe(
        mergeMap((actions) => from(actions)),
        catchError((err) => {
          const msg =
            err?.message === 'NOT_SIGNED_IN'
              ? 'Please sign in again.'
              : err?.message ?? 'Failed to sync Apple Health';

          return of(healthKitSyncFailed(msg));
        })
      );
    })
  );

export const healthKitEpics: Epic<AnyAction, AnyAction, RootState>[] = [
  healthKitSyncEpic
];
