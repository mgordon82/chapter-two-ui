import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface PlanState {
  text: string;
  isAnalyzing: boolean;
  hasSubmittedOnce: boolean;
  error: string;
}

const initialState: PlanState = {
  text: '',
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
    planUpdated(state, action: PayloadAction<string>) {
      state.text = action.payload;
    },
    planCleared(state) {
      state.text = '';
      state.error = '';
    }
  }
});

export const {
  planAnalysisRequested,
  planAnalysisSucceeded,
  planAnalysisFailed,
  planUpdated,
  planCleared
} = planSlice.actions;
export default planSlice.reducer;
