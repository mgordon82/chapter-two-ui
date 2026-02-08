import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type MacroField = 'calories' | 'protein' | 'carbs' | 'fats';

export interface MacrosState {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

export interface PlanState {
  macros: MacrosState;
  isAnalyzing: boolean;
  hasSubmittedOnce: boolean;
  error: string;
}

const emptyMacros: MacrosState = {
  calories: '',
  protein: '',
  carbs: '',
  fats: ''
};

const initialState: PlanState = {
  macros: emptyMacros,
  isAnalyzing: false,
  hasSubmittedOnce: false,
  error: ''
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    planAnalysisRequested(state) {
      state.error = '';
      state.isAnalyzing = true;
    },
    planAnalysisSucceeded(state) {
      state.isAnalyzing = false;
      state.hasSubmittedOnce = true;
    },
    planAnalysisFailed(state, action: PayloadAction<string>) {
      state.isAnalyzing = false;
      state.error = action.payload;
    },

    // Update one field (used by each input)
    macroFieldUpdated(
      state,
      action: PayloadAction<{ field: MacroField; value: string }>
    ) {
      const { field, value } = action.payload;
      state.macros[field] = value;
    },

    // Optional convenience if you ever want to set all at once (presets, autofill, etc.)
    macrosSet(state, action: PayloadAction<MacrosState>) {
      state.macros = action.payload;
    },

    planCleared(state) {
      state.macros = emptyMacros;
      state.error = '';
      state.isAnalyzing = false;
      state.hasSubmittedOnce = false;
    }
  }
});

export const {
  planAnalysisRequested,
  planAnalysisSucceeded,
  planAnalysisFailed,
  macroFieldUpdated,
  macrosSet,
  planCleared
} = planSlice.actions;

export default planSlice.reducer;
