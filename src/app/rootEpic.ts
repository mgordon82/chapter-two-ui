import { combineEpics, type Epic } from 'redux-observable';
import { planEpics } from '../features/plan/planEpics';
import { insightsEpics } from '../features/insights/insightsEpics';

export const rootEpic: Epic = combineEpics(...planEpics, ...insightsEpics);
