import { combineEpics, type Epic } from 'redux-observable';
import { storyEpics } from '../features/story/storyEpics';
import { insightsEpics } from '../features/insights/insightsEpics';

export const rootEpic: Epic = combineEpics(...storyEpics, ...insightsEpics);
