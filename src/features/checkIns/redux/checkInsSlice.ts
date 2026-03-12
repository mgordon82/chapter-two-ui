import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RangeKey } from '../types';

export type CheckIn = {
  _id: string;
  userId: string;
  recordedAt: string;
  metrics: {
    weightKg: number;
    notes?: string;
  };
  hasPhotos?: boolean;
  photos?: {
    photos: Array<{
      position: 'front' | 'side' | 'back';
      storageKey: string;
      mimeType: string;
      originalFileName?: string | null;
      sizeBytes?: number | null;
      uploadedAt?: string;
      viewUrl?: string;
    }>;
  };
  createdAt: string;
  createdByUserId: string;
  isDeleted: boolean;
  source?: {
    type?: 'apple_health' | 'manual';
    integration?: 'apple_health';
    appSourceName?: string | null;
    deviceSourceName?: string | null;
    externalSampleId?: string | null;
    importedAt?: string | null;
  };
};

export type CreateCheckInInput = {
  recordedAt?: string;
  weightKg: number;
  notes?: string;
  progressPhotoSetId?: string;
};

type CheckInsState = {
  items: CheckIn[];
  loading: boolean;
  creating: boolean;
  lastCreatedCheckInId: string | null;
  error: string | null;
  loadedRange: RangeKey | null;
};

const initialState: CheckInsState = {
  items: [],
  loading: false,
  creating: false,
  lastCreatedCheckInId: null,
  error: null,
  loadedRange: null
};

const checkInsSlice = createSlice({
  name: 'checkIns',
  initialState,
  reducers: {
    fetchCheckInsRequested(
      state,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _action: PayloadAction<{ range: RangeKey }>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchCheckInsSucceeded(
      state,
      action: PayloadAction<{ items: CheckIn[]; range: RangeKey }>
    ) {
      state.loading = false;
      state.items = action.payload.items;
      state.loadedRange = action.payload.range;
    },
    fetchCheckInsFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCheckInRequested(state, _action: PayloadAction<CreateCheckInInput>) {
      state.creating = true;
      state.lastCreatedCheckInId = null;
      state.error = null;
    },
    createCheckInSucceeded(state, action: PayloadAction<{ id: string }>) {
      state.creating = false;
      state.lastCreatedCheckInId = action.payload.id;
    },
    createCheckInFailed(state, action: PayloadAction<string>) {
      state.creating = false;
      state.lastCreatedCheckInId = null;
      state.error = action.payload;
    },

    clearLastCreatedCheckInId(state) {
      state.lastCreatedCheckInId = null;
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
  clearLastCreatedCheckInId,
  clearCheckInsError
} = checkInsSlice.actions;

export default checkInsSlice.reducer;
