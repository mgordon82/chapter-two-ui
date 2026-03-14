/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type PhotoPosition = 'front' | 'side' | 'back';

export type StarterPhoto = {
  position: PhotoPosition;
  storageKey: string;
  mimeType: string;
  originalFileName?: string | null;
  sizeBytes?: number | null;
  uploadedAt?: string;
  takenAt?: string | null;
  viewUrl?: string;
};

export type StarterPhotoSet = {
  id: string;
  photos: StarterPhoto[];
};

export type StarterUploadRequestPhoto = {
  position: PhotoPosition;
  mimeType: string;
  originalFileName?: string | null;
  sizeBytes?: number | null;
  file: File;
};

export type StarterUploadSessionPayload = {
  photos: Array<{
    position: PhotoPosition;
    mimeType: string;
    originalFileName?: string | null;
    sizeBytes?: number | null;
  }>;
};

export type StarterUploadSessionItem = {
  position: PhotoPosition;
  mimeType: string;
  originalFileName?: string | null;
  sizeBytes?: number | null;
  storageKey: string;
  uploadUrl: string;
};

export type StarterUploadSessionResponse = {
  photoSetId: string;
  uploads: StarterUploadSessionItem[];
};

export type FinalizeStarterPhotosPayload = {
  photoSetId: string;
  takenAt: string;
  photos: Array<{
    position: PhotoPosition;
    mimeType: string;
    originalFileName?: string | null;
    sizeBytes?: number | null;
  }>;
};

export type ProgressUploadSessionPayload = {
  photos: Array<{
    position: PhotoPosition;
    mimeType: string;
    originalFileName?: string | null;
    sizeBytes?: number | null;
  }>;
};

export type ProgressUploadSessionResponse = {
  photoSetId: string;
  uploads: StarterUploadSessionItem[];
};

export type FinalizeProgressPhotosPayload = {
  photoSetId: string;
  photos: Array<{
    position: PhotoPosition;
    mimeType: string;
    originalFileName?: string | null;
    sizeBytes?: number | null;
  }>;
};

type PhotosState = {
  starterPhotoSet: StarterPhotoSet | null;
  hasStarterPhotos: boolean;
  loadingStarter: boolean;
  creatingStarterUploadSession: boolean;
  starterUploadSession: StarterUploadSessionResponse | null;
  finalizingStarterPhotos: boolean;
  starterError: string | null;

  creatingProgressUploadSession: boolean;
  progressUploadSession: ProgressUploadSessionResponse | null;
  finalizingProgressPhotos: boolean;
  progressError: string | null;
};

const initialState: PhotosState = {
  starterPhotoSet: null,
  hasStarterPhotos: false,
  loadingStarter: false,
  creatingStarterUploadSession: false,
  starterUploadSession: null,
  finalizingStarterPhotos: false,
  starterError: null,

  creatingProgressUploadSession: false,
  progressUploadSession: null,
  finalizingProgressPhotos: false,
  progressError: null
};

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    fetchStarterPhotosRequested(state) {
      state.loadingStarter = true;
      state.starterError = null;
    },
    fetchStarterPhotosSucceeded(
      state,
      action: PayloadAction<{
        hasStarterPhotos: boolean;
        photoSet: StarterPhotoSet | null;
      }>
    ) {
      state.loadingStarter = false;
      state.hasStarterPhotos = action.payload.hasStarterPhotos;
      state.starterPhotoSet = action.payload.photoSet;
    },
    fetchStarterPhotosFailed(state, action: PayloadAction<string>) {
      state.loadingStarter = false;
      state.starterError = action.payload;
    },

    createStarterUploadSessionRequested(
      state,
      _action: PayloadAction<StarterUploadSessionPayload>
    ) {
      state.creatingStarterUploadSession = true;
      state.starterError = null;
      state.starterUploadSession = null;
    },
    createStarterUploadSessionSucceeded(
      state,
      action: PayloadAction<StarterUploadSessionResponse>
    ) {
      state.creatingStarterUploadSession = false;
      state.starterUploadSession = action.payload;
    },
    createStarterUploadSessionFailed(state, action: PayloadAction<string>) {
      state.creatingStarterUploadSession = false;
      state.starterError = action.payload;
    },

    createProgressUploadSessionRequested(
      state,
      _action: PayloadAction<ProgressUploadSessionPayload>
    ) {
      state.creatingProgressUploadSession = true;
      state.progressUploadSession = null;
      state.progressError = null;
    },
    createProgressUploadSessionSucceeded(
      state,
      action: PayloadAction<ProgressUploadSessionResponse>
    ) {
      state.creatingProgressUploadSession = false;
      state.progressUploadSession = action.payload;
    },
    createProgressUploadSessionFailed(state, action: PayloadAction<string>) {
      state.creatingProgressUploadSession = false;
      state.progressError = action.payload;
    },

    finalizeProgressPhotosRequested(
      state,
      _action: PayloadAction<FinalizeProgressPhotosPayload>
    ) {
      state.finalizingProgressPhotos = true;
      state.progressError = null;
    },
    finalizeProgressPhotosSucceeded(state) {
      state.finalizingProgressPhotos = false;
      state.progressUploadSession = null;
    },
    finalizeProgressPhotosFailed(state, action: PayloadAction<string>) {
      state.finalizingProgressPhotos = false;
      state.progressError = action.payload;
    },

    clearProgressUploadSession(state) {
      state.progressUploadSession = null;
    },

    finalizeStarterPhotosRequested(
      state,
      _action: PayloadAction<FinalizeStarterPhotosPayload>
    ) {
      state.finalizingStarterPhotos = true;
      state.starterError = null;
    },
    finalizeStarterPhotosSucceeded(
      state,
      action: PayloadAction<StarterPhotoSet>
    ) {
      state.finalizingStarterPhotos = false;
      state.hasStarterPhotos = true;
      state.starterPhotoSet = action.payload;
      state.starterUploadSession = null;
    },
    finalizeStarterPhotosFailed(state, action: PayloadAction<string>) {
      state.finalizingStarterPhotos = false;
      state.starterError = action.payload;
    },

    clearStarterError(state) {
      state.starterError = null;
    },
    clearProgressError(state) {
      state.progressError = null;
    },
    clearStarterUploadSession(state) {
      state.starterUploadSession = null;
    }
  }
});

export const {
  fetchStarterPhotosRequested,
  fetchStarterPhotosSucceeded,
  fetchStarterPhotosFailed,
  createStarterUploadSessionRequested,
  createStarterUploadSessionSucceeded,
  createStarterUploadSessionFailed,
  createProgressUploadSessionRequested,
  createProgressUploadSessionSucceeded,
  createProgressUploadSessionFailed,
  finalizeProgressPhotosRequested,
  finalizeProgressPhotosSucceeded,
  finalizeProgressPhotosFailed,
  clearProgressUploadSession,
  finalizeStarterPhotosRequested,
  finalizeStarterPhotosSucceeded,
  finalizeStarterPhotosFailed,
  clearStarterError,
  clearProgressError,
  clearStarterUploadSession
} = photosSlice.actions;

export default photosSlice.reducer;
