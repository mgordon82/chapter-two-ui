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
  buildEmptyHealthKitSyncSummary,
  healthKitSyncRequested,
  healthKitSyncSucceeded,
  healthKitSyncFailed
} from './healthKitSlice';
import { fetchDailyMetricsRequested } from '../../healthMetrics/redux/healthMetricsSlice';

const readErrorMessage = async (response: Response) => {
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

  return message;
};

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
            throw new Error(await readErrorMessage(integrationRes));
          }

          const integrationData = (await integrationRes.json()) as {
            ok: true;
            integration: {
              lastSync?: {
                weightRecordedAt?: string | null;
                stepsDate?: string | null;
                waterDate?: string | null;
              } | null;
            } | null;
          };

          const summary = buildEmptyHealthKitSyncSummary();

          const lastWeightRecordedAt =
            integrationData?.integration?.lastSync?.weightRecordedAt ?? null;

          let nextWeightStartDate: string;

          if (lastWeightRecordedAt) {
            const lastDate = new Date(lastWeightRecordedAt);
            nextWeightStartDate = new Date(
              lastDate.getTime() + 1000
            ).toISOString();
          } else {
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            nextWeightStartDate = oneYearAgo.toISOString();
          }

          const weightSamples = await HealthKit.getWeightSamples({
            startDate: nextWeightStartDate,
            limit: 500
          });

          summary.weight.total = weightSamples.items.length;

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
              throw new Error(await readErrorMessage(response));
            }

            const data = (await response.json()) as {
              ok: true;
              status?: 'created' | 'duplicate' | 'conflict_existing_checkin';
            };

            if (data?.status === 'created') {
              summary.weight.createdCount += 1;
            } else if (data?.status === 'duplicate') {
              summary.weight.duplicateCount += 1;
            } else if (data?.status === 'conflict_existing_checkin') {
              summary.weight.conflictCount += 1;
            }
          }

          const lastStepsDate =
            integrationData?.integration?.lastSync?.stepsDate ?? null;

          let nextStepsStartDate: string;

          if (lastStepsDate) {
            nextStepsStartDate = new Date(
              `${lastStepsDate}T00:00:00`
            ).toISOString();
          } else {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            nextStepsStartDate = thirtyDaysAgo.toISOString();
          }

          const dailyStepTotals = await HealthKit.getDailyStepTotals({
            startDate: nextStepsStartDate,
            limit: 30
          });

          summary.steps.total = dailyStepTotals.items.length;

          for (const item of dailyStepTotals.items) {
            const response = await fetch(
              `${API_URL}/api/health-metrics/current-user/import/apple-health/steps`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  date: item.date,
                  metricType: 'steps',
                  value: item.steps,
                  source: {
                    type: 'apple_health',
                    integration: item.source.integration,
                    appSourceName: null,
                    deviceSourceName: null
                  }
                })
              }
            );

            if (!response.ok) {
              throw new Error(await readErrorMessage(response));
            }

            const data = (await response.json()) as {
              ok: true;
              status?: 'created' | 'updated';
            };

            if (data?.status === 'created') {
              summary.steps.createdCount += 1;
            } else if (data?.status === 'updated') {
              summary.steps.updatedCount += 1;
            }
          }

          const lastWaterDate =
            integrationData?.integration?.lastSync?.waterDate ?? null;

          let nextWaterStartDate: string;

          if (lastWaterDate) {
            nextWaterStartDate = new Date(
              `${lastWaterDate}T00:00:00`
            ).toISOString();
          } else {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            nextWaterStartDate = thirtyDaysAgo.toISOString();
          }

          const dailyWaterTotals = await HealthKit.getDailyWaterTotals({
            startDate: nextWaterStartDate,
            limit: 30
          });

          summary.water.total = dailyWaterTotals.items.length;

          for (const item of dailyWaterTotals.items) {
            const response = await fetch(
              `${API_URL}/api/health-metrics/current-user/import/apple-health/water`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  date: item.date,
                  metricType: 'water',
                  value: item.milliliters,
                  source: {
                    type: 'apple_health',
                    integration: item.source.integration,
                    appSourceName: null,
                    deviceSourceName: null
                  }
                })
              }
            );

            if (!response.ok) {
              throw new Error(await readErrorMessage(response));
            }

            const data = (await response.json()) as {
              ok: true;
              status?: 'created' | 'updated';
            };

            if (data?.status === 'created') {
              summary.water.createdCount += 1;
            } else if (data?.status === 'updated') {
              summary.water.updatedCount += 1;
            }
          }

          return [
            healthKitSyncSucceeded(summary),
            fetchCheckInsRequested({ range: '3M' }),
            fetchDailyMetricsRequested({
              metricType: 'steps',
              range: '30D'
            }),
            fetchDailyMetricsRequested({
              metricType: 'water',
              range: '30D'
            })
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
