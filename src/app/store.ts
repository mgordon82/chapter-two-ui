import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';

import authReducer from '../auth/authSlice';
import planReducer from '../features/plan/planSlice';
import insightsReducer from '../features/insights/insightsSlice';
import nutritionCalculatorReducer from '../features/nutritionCalculator/redux/nutritionCalculatorSlice';
import inviteUserReducer from '../features/users/redux/inviteUserSlice';

import { rootEpic } from './rootEpic';
import { appReset } from './appActions';

const epicMiddleware = createEpicMiddleware();

const appReducer = combineReducers({
  plan: planReducer,
  insights: insightsReducer,
  nutritionCalculator: nutritionCalculatorReducer,
  auth: authReducer,
  inviteUser: inviteUserReducer
});

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

epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
