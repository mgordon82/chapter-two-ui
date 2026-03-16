import type { RootState } from '../../../app/store';

export const selectClientProfileState = (state: RootState) =>
  state.clientProfile;

export const selectClientProfile = (state: RootState) =>
  state.clientProfile.profile;

export const selectClientProfileLoading = (state: RootState) =>
  state.clientProfile.isLoading;

export const selectClientProfileError = (state: RootState) =>
  state.clientProfile.error;
