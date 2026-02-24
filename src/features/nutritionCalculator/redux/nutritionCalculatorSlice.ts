/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';

import { appReset } from '../../../app/appActions';

import type { MacroResult } from '../calculations/dailyMacros';
import type { UserProfileResponse } from '../helpers/fetchUserProfile';

import type { MeasurementUnit } from '../../../components/units/MeasurementUnit';
import type { WeightUnit } from '../../../components/units/WeightUnit';

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
      measurementUnitPref: MeasurementUnit;
      weightUnitPref: WeightUnit;
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

export type PersistUserPreferencesPayload = {
  measurementUnitPref: MeasurementUnit;
  weightUnitPref: WeightUnit;
};

export type NutritionCalculatorSavePayload = {
  inputs: unknown;
  calculated: {
    bmr: number | null;
    tdee: number | null;
    weightGoal: unknown;
  };
  macros: MacroResult | null;
  preferences: {
    measurementUnitPref: MeasurementUnit;
    weightUnitPref: WeightUnit;
  };
};

export type SavedNutritionProfile = NutritionCalculatorSavePayload & {
  id: string;
  savedAt: string;
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

const normalizeUserProfile = (
  payload: UserProfileResponse
): UserProfileResponse => {
  const prefs = payload.profile.preferences ?? null;

  return {
    ...payload,
    profile: {
      ...payload.profile,
      preferences: {
        measurementUnitPref: (prefs?.measurementUnitPref ??
          'cm') as MeasurementUnit,
        weightUnitPref: (prefs?.weightUnitPref ?? 'kg') as WeightUnit
      }
    }
  };
};

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
      state.history.unshift(saved);
    },

    clearNutritionHistory(state) {
      state.history = [];
    },

    clearLastSubmitted(state) {
      state.lastSubmitted = null;
    },

    /**
     * ✅ Optimistic, local-only update of prefs.
     * Keeps loadedProfile in sync with what the user selected.
     */
    userPreferencesUpdated(
      state,
      action: PayloadAction<PersistUserPreferencesPayload>
    ) {
      if (!state.loadedProfile) return;

      state.loadedProfile = {
        ...state.loadedProfile,
        profile: {
          ...state.loadedProfile.profile,
          preferences: {
            measurementUnitPref: action.payload.measurementUnitPref,
            weightUnitPref: action.payload.weightUnitPref
          }
        }
      };
    },

    /**
     * Existing full profile save (e.g., Save button)
     */
    persistUserProfileRequested(
      state,
      _action: PayloadAction<UserProfileUpsertPayload>
    ) {
      state.isSavingRemote = true;
      state.remoteError = null;
    },

    /**
     * ✅ New: preferences-only save (e.g., unit toggles)
     */
    persistUserPreferencesRequested(
      state,
      _action: PayloadAction<PersistUserPreferencesPayload>
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
      state.loadedProfile = normalizeUserProfile(action.payload);
    },

    loadUserProfileFailed(state, action: PayloadAction<string>) {
      state.isLoadingProfile = false;
      state.loadProfileError = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(appReset, () => initialState);
  }
});

export const {
  saveNutritionProfile,
  clearNutritionHistory,
  clearLastSubmitted,
  userPreferencesUpdated,
  persistUserProfileRequested,
  persistUserPreferencesRequested,
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

export const selectLoadedUserProfile = (state: RootState) =>
  state.nutritionCalculator.loadedProfile;

export const selectUserUnitPrefs = (state: RootState) => {
  const prefs = state.nutritionCalculator.loadedProfile?.profile.preferences;

  return {
    measurementUnitPref: (prefs?.measurementUnitPref ??
      'cm') as MeasurementUnit,
    weightUnitPref: (prefs?.weightUnitPref ?? 'kg') as WeightUnit
  };
};
