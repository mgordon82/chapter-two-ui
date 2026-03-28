/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RangeKey } from '../types';

export type MappedCheckIn = {
  id: string;
  userId: string;

  periodType: 'day' | 'week' | 'month' | 'quarter' | 'year' | null;
  periodKey: string | null;
  representedDate: string | null;
  recordedAt: string | null;
  displayDate: string | null;

  status: 'open' | 'closed' | null;
  manualEditWindowEndsAt: string | null;
  isEditable: boolean;
  isDeleted: boolean;
  lifecycleState: 'open' | 'closed' | 'expired';

  weightKg: number | null;
  weightSource: 'manual' | 'apple_health' | 'legacy' | null;
  hasWeightConflict: boolean;
  alternateWeights?: Array<{
    source: 'manual' | 'apple_health' | 'legacy';
    weightKg: number;
  }>;
  energyLevel: number | null;
  onTrackLevel: number | null;
  calories: number | null;
  proteinGrams: number | null;
  restingHeartRate: number | null;
  steps: number | null;
  totalExerciseMinutes: number | null;
  standGoal: number | null;
  notes: string | null;

  suggestedExerciseSessionIds: string[];
  includedExerciseSessionIds: string[];
  excludedExerciseSessionIds: string[];
  hasExerciseSelections: boolean;
  includedExerciseSessionCount: number;
  excludedExerciseSessionCount: number;

  hasNutrition: boolean;
  hasCoreDailyMetrics: boolean;
  hasAnyContent: boolean;

  photoSetId: string | null;
  hasPhotoSet: boolean;
  hasPhotos: boolean;
  photos: Array<{
    position: string | null;
    storageKey: string | null;
    mimeType: string | null;
    originalFileName: string | null;
    sizeBytes: number | null;
    uploadedAt: string | null;
    viewUrl?: string | null;
  }>;

  coachFeedback: {
    coachUserId: string;
    feedback: string;
    createdAt: string | null;
    updatedAt: string | null;
    visibleToUser: boolean;
  } | null;
  hasCoachFeedback: boolean;

  raw: unknown;
};

export type MappedExerciseSession = {
  id: string;
  userId: string;

  performedAt: string | null;
  localDateKey: string | null;
  startedAt: string | null;
  endedAt: string | null;

  source: {
    type: string | null;
    integration: string | null;
    externalId: string | null;
    importedAt: string | null;
  };

  sessionType: string | null;
  name: string | null;
  notes: string | null;
  focusArea: string | null;

  metrics: {
    durationMinutes: number | null;
    caloriesBurned: number | null;
    distanceMeters: number | null;
    stepCount: number | null;
  };

  links: {
    plannedWorkoutId: string | null;
    completedWorkoutId: string | null;
  };

  createdAt: string | null;
  updatedAt: string | null;

  raw: unknown;
};

export type CreateCheckInInput = {
  representedDate: string;
  recordedAt?: string;
  weightKg?: number;
  notes?: string;
  energyLevel?: number;
  onTrackLevel?: number;
  checkInType?: 'daily' | 'weekly';
  progressPhotoSetId?: string;
};

export type CreateExerciseSessionInput = {
  performedAt: string;
  sessionType?: string | null;
  name: string;
  focusArea?: string | null;
  notes?: string | null;
  metrics?: {
    durationMinutes?: number | null;
  };
};

export type SaveExerciseSelectionInput = {
  id: string;
  autoSuggestedExerciseSessionIds: string[];
  includedExerciseSessionIds: string[];
  excludedExerciseSessionIds: string[];
};

type CheckInsState = {
  items: MappedCheckIn[];
  loading: boolean;

  selectedDate: string | null;
  selectedDateItem: MappedCheckIn | null;
  selectedDateSuggestedExerciseSessions: MappedExerciseSession[];
  loadingSelectedDate: boolean;
  selectedDateError: string | null;

  creating: boolean;
  creatingExerciseSession: boolean;
  updatingLifecycle: boolean;
  savingExerciseSelection: boolean;
  lastCreatedCheckInId: string | null;
  lastCreatedExerciseSessionId: string | null;
  error: string | null;
  loadedRange: RangeKey | null;
};

const initialState: CheckInsState = {
  items: [],
  loading: false,

  selectedDate: null,
  selectedDateItem: null,
  selectedDateSuggestedExerciseSessions: [],
  loadingSelectedDate: false,
  selectedDateError: null,

  creating: false,
  creatingExerciseSession: false,
  updatingLifecycle: false,
  savingExerciseSelection: false,
  lastCreatedCheckInId: null,
  lastCreatedExerciseSessionId: null,
  error: null,
  loadedRange: null
};

const checkInsSlice = createSlice({
  name: 'checkIns',
  initialState,
  reducers: {
    fetchCheckInsRequested(state, _action: PayloadAction<{ range: RangeKey }>) {
      state.loading = true;
      state.error = null;
    },
    fetchCheckInsSucceeded(
      state,
      action: PayloadAction<{ items: MappedCheckIn[]; range: RangeKey }>
    ) {
      state.loading = false;
      state.items = action.payload.items;
      state.loadedRange = action.payload.range;
    },
    fetchCheckInsFailed(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchCheckInByDateRequested(
      state,
      action: PayloadAction<{ date: string }>
    ) {
      state.loadingSelectedDate = true;
      state.selectedDateError = null;
      state.selectedDate = action.payload.date;
    },
    fetchCheckInByDateSucceeded(
      state,
      action: PayloadAction<{
        date: string;
        item: MappedCheckIn | null;
        suggestedExerciseSessions: MappedExerciseSession[];
      }>
    ) {
      if (state.selectedDate !== action.payload.date) {
        return;
      }

      state.loadingSelectedDate = false;
      state.selectedDateItem = action.payload.item;
      state.selectedDateSuggestedExerciseSessions =
        action.payload.suggestedExerciseSessions;
    },
    fetchCheckInByDateFailed(
      state,
      action: PayloadAction<{ date: string; message: string }>
    ) {
      if (state.selectedDate !== action.payload.date) {
        return;
      }

      state.loadingSelectedDate = false;
      state.selectedDateError = action.payload.message;
    },

    clearSelectedDateCheckIn(state) {
      state.selectedDate = null;
      state.selectedDateItem = null;
      state.selectedDateSuggestedExerciseSessions = [];
      state.loadingSelectedDate = false;
      state.selectedDateError = null;
    },

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
    createExerciseSessionRequested(
      state,
      _action: PayloadAction<CreateExerciseSessionInput>
    ) {
      state.creatingExerciseSession = true;
      state.lastCreatedExerciseSessionId = null;
      state.error = null;
    },
    createExerciseSessionSucceeded(
      state,
      action: PayloadAction<{ id: string }>
    ) {
      state.creatingExerciseSession = false;
      state.lastCreatedExerciseSessionId = action.payload.id;
    },
    createExerciseSessionFailed(state, action: PayloadAction<string>) {
      state.creatingExerciseSession = false;
      state.lastCreatedExerciseSessionId = null;
      state.error = action.payload;
    },
    clearLastCreatedExerciseSessionId(state) {
      state.lastCreatedExerciseSessionId = null;
    },
    closeCheckInRequested(state, _action: PayloadAction<{ id: string }>) {
      state.updatingLifecycle = true;
      state.error = null;
    },
    closeCheckInSucceeded(state) {
      state.updatingLifecycle = false;
    },
    closeCheckInFailed(state, action: PayloadAction<string>) {
      state.updatingLifecycle = false;
      state.error = action.payload;
    },

    reopenCheckInRequested(state, _action: PayloadAction<{ id: string }>) {
      state.updatingLifecycle = true;
      state.error = null;
    },
    reopenCheckInSucceeded(state) {
      state.updatingLifecycle = false;
    },
    reopenCheckInFailed(state, action: PayloadAction<string>) {
      state.updatingLifecycle = false;
      state.error = action.payload;
    },

    saveExerciseSelectionRequested(
      state,
      _action: PayloadAction<SaveExerciseSelectionInput>
    ) {
      state.savingExerciseSelection = true;
      state.error = null;
    },
    saveExerciseSelectionSucceeded(state) {
      state.savingExerciseSelection = false;
    },
    saveExerciseSelectionFailed(state, action: PayloadAction<string>) {
      state.savingExerciseSelection = false;
      state.error = action.payload;
    },

    clearLastCreatedCheckInId(state) {
      state.lastCreatedCheckInId = null;
    },

    clearCheckInsError(state) {
      state.error = null;
    },

    clearSelectedDateError(state) {
      state.selectedDateError = null;
    }
  }
});

export const {
  fetchCheckInsRequested,
  fetchCheckInsSucceeded,
  fetchCheckInsFailed,
  fetchCheckInByDateRequested,
  fetchCheckInByDateSucceeded,
  fetchCheckInByDateFailed,
  clearSelectedDateCheckIn,
  clearLastCreatedExerciseSessionId,
  createCheckInRequested,
  createCheckInSucceeded,
  createCheckInFailed,
  createExerciseSessionRequested,
  createExerciseSessionSucceeded,
  createExerciseSessionFailed,
  closeCheckInRequested,
  closeCheckInSucceeded,
  closeCheckInFailed,
  reopenCheckInRequested,
  reopenCheckInSucceeded,
  reopenCheckInFailed,
  saveExerciseSelectionRequested,
  saveExerciseSelectionSucceeded,
  saveExerciseSelectionFailed,
  clearLastCreatedCheckInId,
  clearCheckInsError,
  clearSelectedDateError
} = checkInsSlice.actions;

export default checkInsSlice.reducer;
