import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { MacroResult } from '../calculations/dailyMacros';

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
};

const initialState: NutritionCalculatorState = {
  lastSubmitted: null,
  history: []
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
    }
  }
});

export const {
  saveNutritionProfile,
  clearNutritionHistory,
  clearLastSubmitted
} = nutritionCalculatorSlice.actions;

export default nutritionCalculatorSlice.reducer;

// Selectors
export const selectLastSubmittedNutrition = (state: RootState) =>
  state.nutritionCalculator.lastSubmitted;

export const selectNutritionHistory = (state: RootState) =>
  state.nutritionCalculator.history;
