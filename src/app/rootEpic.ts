import { combineEpics } from 'redux-observable';
import { authEpic } from '../auth/authEpic';
import { planEpics } from '../features/plan/planEpics';
import { insightsEpics } from '../features/insights/insightsEpics';
import { inviteUserEpic } from '../features/users/redux/inviteUserEpic';

export const rootEpic = combineEpics(
  authEpic,
  ...planEpics,
  ...insightsEpics,
  inviteUserEpic
);
