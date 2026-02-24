import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import type { AnyAction } from '@reduxjs/toolkit';

import authReducer from '../auth/authSlice';
import planReducer from '../features/plan/planSlice';
import insightsReducer from '../features/insights/insightsSlice';
import nutritionCalculatorReducer from '../features/nutritionCalculator/redux/nutritionCalculatorSlice';
import inviteUserReducer from '../features/users/redux/inviteUserSlice';
import checkInsReducer from '../features/checkIns/redux/checkInsSlice';

import { rootEpic } from './rootEpic';
import { appReset } from './appActions';

// Build app reducer first
const appReducer = combineReducers({
  plan: planReducer,
  insights: insightsReducer,
  nutritionCalculator: nutritionCalculatorReducer,
  auth: authReducer,
  inviteUser: inviteUserReducer,
  checkIns: checkInsReducer
});

// ✅ RootState should come from appReducer (not rootReducer) to avoid circular typing issues
export type RootState = ReturnType<typeof appReducer>;

// ✅ Type epic middleware so it doesn't default to unknown/void
const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, RootState>();

const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === appReset.type) {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false
    }).concat(epicMiddleware)
});

// ✅ rootEpic is typed, and middleware is typed — these now match
epicMiddleware.run(rootEpic);

export type AppDispatch = typeof store.dispatch;
