import { combineEpics, type Epic } from 'redux-observable';
import type { AnyAction } from '@reduxjs/toolkit';

import type { RootState } from './store';

import { authEpic } from '../auth/authEpic';
import { planEpics } from '../features/plan/planEpics';
import { insightsEpics } from '../features/insights/insightsEpics';
import { inviteUserEpic } from '../features/users/redux/inviteUserEpic';
import { nutritionCalculatorEpics } from '../features/nutritionCalculator/redux/nutritionCalculatorEpics';
import { checkInsEpics } from '../features/checkIns/redux/checkInsEpics';
import { trendEpics } from '../features/trend/redux/trendEpic';
import { photosEpics } from '../features/photos/redux/photosEpics';
import { healthKitEpics } from '../features/healthKit/redux/healthKitEpics';
import { userEpics } from '../features/users/redux/userEpics';
import { coachOptionsEpic } from '../features/users/redux/coachOptionsEpics';
import { assignCoachEpic } from '../features/users/redux/assignCoachEpics';

export const rootEpic: Epic<AnyAction, AnyAction, RootState> = combineEpics(
  authEpic,
  ...planEpics,
  ...insightsEpics,
  inviteUserEpic,
  ...nutritionCalculatorEpics,
  ...checkInsEpics,
  ...trendEpics,
  ...photosEpics,
  ...healthKitEpics,
  ...userEpics,
  coachOptionsEpic,
  assignCoachEpic
);
