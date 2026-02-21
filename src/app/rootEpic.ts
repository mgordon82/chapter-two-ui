import { combineEpics } from 'redux-observable';
import { authEpic } from '../auth/authEpic';
import { planEpics } from '../features/plan/planEpics';
import { insightsEpics } from '../features/insights/insightsEpics';

export const rootEpic = combineEpics(authEpic, ...planEpics, ...insightsEpics);
