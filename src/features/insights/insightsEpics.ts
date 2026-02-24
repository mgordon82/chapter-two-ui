import type { Epic } from 'redux-observable';
import type { AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

// Keep this typed so it doesn't force combineEpics() to infer unknown/void.
export const insightsEpics: Epic<AnyAction, AnyAction, RootState>[] = [];
