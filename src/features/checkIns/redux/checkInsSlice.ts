import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CheckIn = {
  _id: string;
  userId: string;
  recordedAt: string;
  metrics: {
    weightKg: number;
    notes?: string;
  };
  createdAt: string;
  createdByUserId: string;
  isDeleted: boolean;
};

export type CreateCheckInInput = {
  recordedAt?: string;
  weightKg: number;
  notes?: string;
};

type CheckInsState = {
  items: CheckIn[];
  loading: boolean;
  creating: boolean;
  error: string | null;
};

const initialState: CheckInsState = {
  items: [],
  loading: false,
  creating: false,
  error: null
};

const checkInsSlice = createSlice({
  name: 'checkIns',
  initialState,
  reducers: {
    fetchCheckInsRequested(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCheckInsSucceeded(state, action: PayloadAction<CheckIn[]>) {
      state.loading = false;
      state.items = action.payload;
    },
    fetchCheckInsFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCheckInRequested(state, _action: PayloadAction<CreateCheckInInput>) {
      state.creating = true;
      state.error = null;
    },
    createCheckInSucceeded(state) {
      state.creating = false;
    },
    createCheckInFailed(state, action: PayloadAction<string>) {
      state.creating = false;
      state.error = action.payload;
    },

    clearCheckInsError(state) {
      state.error = null;
    }
  }
});

export const {
  fetchCheckInsRequested,
  fetchCheckInsSucceeded,
  fetchCheckInsFailed,
  createCheckInRequested,
  createCheckInSucceeded,
  createCheckInFailed,
  clearCheckInsError
} = checkInsSlice.actions;

export default checkInsSlice.reducer;
