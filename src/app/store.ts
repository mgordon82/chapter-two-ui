import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import storyReducer from '../features/story/storySlice';
import insightsReducer from '../features/insights/insightsSlice';
import { rootEpic } from './rootEpic';

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: {
    story: storyReducer,
    insights: insightsReducer
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
