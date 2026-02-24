import { combineEpics, type Epic } from 'redux-observable';
import type { AnyAction } from '@reduxjs/toolkit';

import type { RootState } from './store';

import { authEpic } from '../auth/authEpic';
import { planEpics } from '../features/plan/planEpics';
import { insightsEpics } from '../features/insights/insightsEpics';
import { inviteUserEpic } from '../features/users/redux/inviteUserEpic';
import { nutritionCalculatorEpics } from '../features/nutritionCalculator/redux/nutritionCalculatorEpics';

export const rootEpic: Epic<AnyAction, AnyAction, RootState> = combineEpics(
  authEpic,
  ...planEpics,
  ...insightsEpics,
  inviteUserEpic,
  ...nutritionCalculatorEpics
);
