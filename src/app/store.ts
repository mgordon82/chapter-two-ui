import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import authReducer from '../auth/authSlice';
import planReducer from '../features/plan/planSlice';
import insightsReducer from '../features/insights/insightsSlice';
import nutritionCalculatorReducer from '../features/nutritionCalculator/redux/nutritionCalculatorSlice';
import inviteUserReducer from '../features/users/redux/InviteUserSlice';
import { rootEpic } from './rootEpic';

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    plan: planReducer,
    insights: insightsReducer,
    nutritionCalculator: nutritionCalculatorReducer,
    auth: authReducer,
    inviteUser: inviteUserReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false
    }).concat(epicMiddleware)
});

epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
