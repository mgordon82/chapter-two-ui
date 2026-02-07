import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface StoryState {
  text: string;
  isAnalyzing: boolean;
  hasSubmittedOnce: boolean;
  error: string;
}

const initialState: StoryState = {
  text: '',
  isAnalyzing: false,
  hasSubmittedOnce: false,
  error: ''
};

const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    storyAnalysisRequested(state) {
      state.error = '';
      state.isAnalyzing = true;
    },
    storyAnalysisSucceeded(state) {
      state.isAnalyzing = false;
      state.hasSubmittedOnce = true;
    },
    storyAnalysisFailed(state, action: PayloadAction<string>) {
      state.isAnalyzing = false;
      state.error = action.payload;
    },
    storyUpdated(state, action: PayloadAction<string>) {
      state.text = action.payload;
    },
    storyCleared(state) {
      state.text = '';
      state.error = '';
    }
  }
});

export const {
  storyAnalysisRequested,
  storyAnalysisSucceeded,
  storyAnalysisFailed,
  storyUpdated,
  storyCleared
} = storySlice.actions;
export default storySlice.reducer;
