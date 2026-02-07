import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plan: undefined
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    insightsSet(state, action) {
      state.plan = action.payload;
    },
    insightsCleared(state) {
      state.plan = undefined;
    }
  }
});

export const { insightsSet, insightsCleared } = insightsSlice.actions;
export default insightsSlice.reducer;
