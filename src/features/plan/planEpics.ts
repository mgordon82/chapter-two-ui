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
// import type { InsightItem } from '../../types/insights';

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

export const analyzePlanEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType(planAnalysisRequested.type),
    mergeMap(() => {
      const root = state$.value as unknown as { plan: PlanState };
      const planText = root.plan.text.trim();

      if (!planText) {
        return of(
          planAnalysisFailed('Please enter your plan before continuing.')
        );
      }

      const API_URL = import.meta.env.VITE_API_URL;

      const payload = {
        planText
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
        mergeMap((data) => {
          return of(insightsSet(data), planAnalysisSucceeded());
        }),
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
