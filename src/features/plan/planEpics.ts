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

const parseRequiredInt = (value: string): number | null => {
  const trimmed = value.trim();
  if (trimmed === '') return null;

  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  if (!Number.isInteger(num)) return null;
  if (num < 0) return null;

  return num;
};

export const analyzePlanEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType(planAnalysisRequested.type),
    mergeMap(() => {
      const root = state$.value as unknown as RootState;
      const { macros, details } = root.plan;

      const calories = parseRequiredInt(macros.calories);
      const protein = parseRequiredInt(macros.protein);
      const carbs = parseRequiredInt(macros.carbs);
      const fats = parseRequiredInt(macros.fats);

      if (
        calories === null ||
        protein === null ||
        carbs === null ||
        fats === null
      ) {
        return of(
          planAnalysisFailed(
            'Please enter valid numbers for calories, protein, carbs, and fats.'
          )
        );
      }

      const API_URL = import.meta.env.VITE_API_URL;

      const payload = {
        macros: {
          calories,
          protein,
          carbs,
          fats
        },
        details
      };

      return from(
        fetch(`${API_URL}/api/plan/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }).then(async (res) => {
          if (!res.ok) {
            const message =
              (await res.text().catch(() => '')) ||
              'Failed to analyze your plan.';
            throw new Error(message);
          }

          return res.json() as Promise<ApiAnalysisResponse>;
        })
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
