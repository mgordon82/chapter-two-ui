/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type InviteOnboardingSubmitPayload = {
  userId: string;
  token: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  pronouns: string | null;

  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  weightKg: number | null;
  heightCm: number | null;
  job: string;

  training: {
    location: string;
    homeEquipment: string[];
    gymEquipment: string[];
    daysPerWeek: number;
    days: string[];
    sessionTime: string;
  };

  injuries: {
    has: boolean;
    details: string;
  };

  nutrition: {
    followedApproach: boolean;
    approachDetails: string;
    perfectNutrition: string;
    favoriteFoods: string;
    leastFavoriteFoods: string;
  };

  motivation: {
    reason: string;
    style: string;
    interestedInExtraIncome: boolean;
  };
};

export type InvitationLookup = {
  userId: string;
  email: string;
  status: string | null;
  onboardingStatus: string | null;
};

type InviteOnboardingState = {
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitError: string | null;
  loadStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  loadError: string | null;
  invitation: InvitationLookup | null;
};

const initialState: InviteOnboardingState = {
  submitStatus: 'idle',
  submitError: null,
  loadStatus: 'idle',
  loadError: null,
  invitation: null
};

const inviteOnboardingSlice = createSlice({
  name: 'inviteOnboarding',
  initialState,
  reducers: {
    loadInvitationRequested: (
      state,
      _action: PayloadAction<{ userId: string; token: string }>
    ) => {
      state.loadStatus = 'loading';
      state.loadError = null;
    },

    loadInvitationSucceeded: (
      state,
      action: PayloadAction<InvitationLookup>
    ) => {
      state.loadStatus = 'succeeded';
      state.loadError = null;
      state.invitation = action.payload;
    },

    loadInvitationFailed: (state, action: PayloadAction<string>) => {
      state.loadStatus = 'failed';
      state.loadError = action.payload;
      state.invitation = null;
    },

    submitInviteOnboardingRequested: (
      state,
      _action: PayloadAction<InviteOnboardingSubmitPayload>
    ) => {
      state.submitStatus = 'loading';
      state.submitError = null;
    },

    submitInviteOnboardingSucceeded: (state) => {
      state.submitStatus = 'succeeded';
      state.submitError = null;
    },

    submitInviteOnboardingFailed: (state, action: PayloadAction<string>) => {
      state.submitStatus = 'failed';
      state.submitError = action.payload;
    },

    resetInviteOnboardingState: (state) => {
      state.submitStatus = 'idle';
      state.submitError = null;
      state.loadStatus = 'idle';
      state.loadError = null;
      state.invitation = null;
    }
  }
});

export const {
  loadInvitationRequested,
  loadInvitationSucceeded,
  loadInvitationFailed,
  submitInviteOnboardingRequested,
  submitInviteOnboardingSucceeded,
  submitInviteOnboardingFailed,
  resetInviteOnboardingState
} = inviteOnboardingSlice.actions;

export default inviteOnboardingSlice.reducer;
