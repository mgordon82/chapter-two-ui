/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { MacroResult } from '../calculations/dailyMacros';
import type { UserProfileResponse } from '../helpers/fetchUserProfile';

export type UserProfileUpsertPayload = {
  profile: {
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
    goalWeightKg: number | null;
    activityLevel: string | null;
    goal: string | null;
    rateLevel: string | null;
    preferences: {
      measurementUnitPref: string;
      weightUnitPref: string;
    };
  };
  calculated: {
    bmr: number | null;
    tdee: number | null;
    weightGoal: unknown;
  };
  nutrition: {
    targets: {
      calories: number | null;
      protein: number | null;
      carbs: number | null;
      fats: number | null;
    };
  };
};

// If you already have proper types for these, replace the `unknown`/`Record` types.
export type NutritionCalculatorSavePayload = {
  inputs: unknown; // ideally: NutritionInputs
  calculated: {
    bmr: number | null;
    tdee: number | null;
    weightGoal: unknown; // ideally: WeightGoal (or a string union)
  };
  macros: MacroResult | null;
  preferences: {
    measurementUnitPref: string; // tighten later (e.g., 'imperial' | 'metric')
    weightUnitPref: string; // tighten later (e.g., 'lb' | 'kg')
  };
};

export type SavedNutritionProfile = NutritionCalculatorSavePayload & {
  id: string;
  savedAt: string; // ISO string so it's serializable
};

type NutritionCalculatorState = {
  lastSubmitted: SavedNutritionProfile | null;
  history: SavedNutritionProfile[];
  isSavingRemote: boolean;
  remoteError: string | null;
  remoteSavedAt: string | null;
  isLoadingProfile: boolean;
  loadProfileError: string | null;
  loadedProfile: UserProfileResponse | null;
};

const initialState: NutritionCalculatorState = {
  lastSubmitted: null,
  history: [],
  isSavingRemote: false,
  remoteError: null,
  remoteSavedAt: null,
  isLoadingProfile: false,
  loadProfileError: null,
  loadedProfile: null
};

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const nutritionCalculatorSlice = createSlice({
  name: 'nutritionCalculator',
  initialState,
  reducers: {
    saveNutritionProfile(
      state,
      action: PayloadAction<NutritionCalculatorSavePayload>
    ) {
      const saved: SavedNutritionProfile = {
        ...action.payload,
        id: makeId(),
        savedAt: new Date().toISOString()
      };

      state.lastSubmitted = saved;
      state.history.unshift(saved); // newest first
    },

    clearNutritionHistory(state) {
      state.history = [];
      // keep lastSubmitted as-is (handy), but you can null it too if you want
    },

    clearLastSubmitted(state) {
      state.lastSubmitted = null;
    },
    persistUserProfileRequested(
      state,
      _action: PayloadAction<UserProfileUpsertPayload>
    ) {
      state.isSavingRemote = true;
      state.remoteError = null;
    },

    persistUserProfileSucceeded(state) {
      state.isSavingRemote = false;
      state.remoteError = null;
      state.remoteSavedAt = new Date().toISOString();
    },

    persistUserProfileFailed(state, action: PayloadAction<string>) {
      state.isSavingRemote = false;
      state.remoteError = action.payload;
    },
    loadUserProfileRequested(state) {
      state.isLoadingProfile = true;
      state.loadProfileError = null;
    },

    loadUserProfileSucceeded(
      state,
      action: PayloadAction<UserProfileResponse>
    ) {
      state.isLoadingProfile = false;
      state.loadProfileError = null;
      state.loadedProfile = action.payload;
    },

    loadUserProfileFailed(state, action: PayloadAction<string>) {
      state.isLoadingProfile = false;
      state.loadProfileError = action.payload;
    }
  }
});

export const {
  saveNutritionProfile,
  clearNutritionHistory,
  clearLastSubmitted,
  persistUserProfileRequested,
  persistUserProfileSucceeded,
  persistUserProfileFailed,
  loadUserProfileRequested,
  loadUserProfileSucceeded,
  loadUserProfileFailed
} = nutritionCalculatorSlice.actions;

export default nutritionCalculatorSlice.reducer;

// Selectors
export const selectLastSubmittedNutrition = (state: RootState) =>
  state.nutritionCalculator.lastSubmitted;

export const selectNutritionHistory = (state: RootState) =>
  state.nutritionCalculator.history;
