import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type PhotoPosition = 'front' | 'side' | 'back';

export type StarterPhoto = {
  position: PhotoPosition;
  storageKey: string;
  mimeType: string;
  originalFileName?: string | null;
  sizeBytes?: number | null;
  uploadedAt?: string;
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

  creatingProgressUploadSession: boolean;
  progressUploadSession: ProgressUploadSessionResponse | null;
  finalizingProgressPhotos: boolean;

  error: string | null;
};

const initialState: PhotosState = {
  starterPhotoSet: null,
  hasStarterPhotos: false,
  loadingStarter: false,
  creatingStarterUploadSession: false,
  starterUploadSession: null,
  finalizingStarterPhotos: false,

  creatingProgressUploadSession: false,
  progressUploadSession: null,
  finalizingProgressPhotos: false,

  error: null
};

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    fetchStarterPhotosRequested(state) {
      state.loadingStarter = true;
      state.error = null;
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
      state.error = action.payload;
    },

    createStarterUploadSessionRequested(
      state,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _action: PayloadAction<StarterUploadSessionPayload>
    ) {
      state.creatingStarterUploadSession = true;
      state.error = null;
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
      state.error = action.payload;
    },
    createProgressUploadSessionRequested(
      state,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _action: PayloadAction<ProgressUploadSessionPayload>
    ) {
      state.creatingProgressUploadSession = true;
      state.progressUploadSession = null;
      state.error = null;
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
      state.error = action.payload;
    },

    finalizeProgressPhotosRequested(
      state,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _action: PayloadAction<FinalizeProgressPhotosPayload>
    ) {
      state.finalizingProgressPhotos = true;
      state.error = null;
    },
    finalizeProgressPhotosSucceeded(state) {
      state.finalizingProgressPhotos = false;
      state.progressUploadSession = null;
    },
    finalizeProgressPhotosFailed(state, action: PayloadAction<string>) {
      state.finalizingProgressPhotos = false;
      state.error = action.payload;
    },

    clearProgressUploadSession(state) {
      state.progressUploadSession = null;
    },

    finalizeStarterPhotosRequested(
      state,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _action: PayloadAction<FinalizeStarterPhotosPayload>
    ) {
      state.finalizingStarterPhotos = true;
      state.error = null;
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
      state.error = action.payload;
    },

    clearPhotosError(state) {
      state.error = null;
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
  clearPhotosError,
  clearStarterUploadSession
} = photosSlice.actions;

export default photosSlice.reducer;
