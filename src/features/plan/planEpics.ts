import { type Epic, ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import {
  planAnalysisRequested,
  planAnalysisSucceeded,
  planAnalysisFailed,
  type PlanState
} from './planSlice';
import { insightsSet } from '../insights/insightsSlice';
import { getAccessToken } from '../../auth/helpers/getAccessToken';

type ApiAnalysisResponse = {
  analysisSummary: string;
  unfairnessScore: number;
  factors: { label: string; description: string; weight: number }[];
  suggestions: string[];
  resourceLinks: { label: string; url: string }[];
  reframes: string[];
  safetyNotes: string[];
  metadata: unknown;
};

type RootState = { plan: PlanState };

const parseRequiredNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;

  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  if (num < 0) return null;

  return num;
};

const toInt = (n: number) => Math.round(n);

export const analyzePlanEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType(planAnalysisRequested.type),
    mergeMap(() => {
      const root = state$.value as unknown as RootState;
      const { macros, details } = root.plan;

      const caloriesN = parseRequiredNumber(macros.calories);
      const proteinN = parseRequiredNumber(macros.protein);
      const carbsN = parseRequiredNumber(macros.carbs);
      const fatsN = parseRequiredNumber(macros.fat);

      if ([caloriesN, proteinN, carbsN, fatsN].some((v) => v === null)) {
        return of(
          planAnalysisFailed(
            'Please enter valid numbers for calories, protein, carbs, and fats.'
          )
        );
      }

      const API_URL = import.meta.env.VITE_API_URL;

      const payload = {
        macros: {
          calories: toInt(caloriesN!),
          protein: toInt(proteinN!),
          carbs: toInt(carbsN!),
          fats: toInt(fatsN!)
        },
        details
      };

      return from(
        (async () => {
          const token = await getAccessToken();
          if (!token) {
            throw new Error('You must be signed in to analyze a plan.');
          }

          const res = await fetch(`${API_URL}/api/plan/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const message =
              (await res.text().catch(() => '')) ||
              'Failed to analyze your plan.';
            throw new Error(message);
          }

          return (await res.json()) as ApiAnalysisResponse;
        })()
      ).pipe(
        mergeMap((data) => of(insightsSet(data), planAnalysisSucceeded())),
        catchError((err) =>
          of(
            planAnalysisFailed(
              err instanceof Error
                ? err.message
                : 'Something went wrong while analyzing your plan.'
            )
          )
        )
      );
    })
  );

export const planEpics: Epic[] = [analyzePlanEpic];
