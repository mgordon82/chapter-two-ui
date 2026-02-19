import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type MacroField = 'calories' | 'protein' | 'carbs' | 'fat';

export interface MacrosState {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface PlanState {
  macros: MacrosState;
  details: string;
  isAnalyzing: boolean;
  hasSubmittedOnce: boolean;
  error: string;
}

const emptyMacros: MacrosState = {
  calories: '',
  protein: '',
  carbs: '',
  fat: ''
};

const initialState: PlanState = {
  macros: emptyMacros,
  details: '',
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

    macroFieldUpdated(
      state,
      action: PayloadAction<{ field: MacroField; value: string }>
    ) {
      const { field, value } = action.payload;
      state.macros[field] = value;
    },

    detailsUpdated(state, action) {
      const details = action.payload;
      state.details = details;
    },

    macrosSet(state, action: PayloadAction<MacrosState>) {
      state.macros = action.payload;
    },

    planCleared(state) {
      state.macros = emptyMacros;
      state.details = '';
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
  detailsUpdated,
  macrosSet,
  planCleared
} = planSlice.actions;

export default planSlice.reducer;
