import { type Epic, ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import {
  storyAnalysisRequested,
  storyAnalysisSucceeded,
  storyAnalysisFailed,
  type StoryState
} from './storySlice';
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

export const analyzeStoryEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType(storyAnalysisRequested.type),
    mergeMap(() => {
      const root = state$.value as unknown as { story: StoryState };
      const storyText = root.story.text.trim();

      if (!storyText) {
        return of(
          storyAnalysisFailed('Please enter your story before continuing.')
        );
      }

      const API_URL = import.meta.env.VITE_API_URL;

      const payload = {
        storyText
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
              'Failed to analyze your story.';
            throw new Error(message);
          }

          return res.json() as Promise<ApiAnalysisResponse>;
        })
      ).pipe(
        mergeMap((data) => {
          return of(insightsSet(data), storyAnalysisSucceeded());
        }),
        catchError((err) =>
          of(
            storyAnalysisFailed(
              err instanceof Error
                ? err.message
                : 'Something went wrong while analyzing your story.'
            )
          )
        )
      );
    })
  );

export const storyEpics: Epic[] = [analyzeStoryEpic];
