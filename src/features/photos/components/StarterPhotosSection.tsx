import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { useDispatch } from 'react-redux';

import { useAppSelector } from '../../../app/hooks';
import {
  clearStarterUploadSession,
  createStarterUploadSessionRequested,
  fetchStarterPhotosRequested,
  finalizeStarterPhotosRequested,
  type PhotoPosition,
  type StarterUploadRequestPhoto
} from '../redux/photosSlice';
import { normalizeImageFile } from '../helpers/normalizeImageFile';
import { uploadPhotoToSignedUrl } from '../helpers/uploadPhotoToSignedUrl';
import { validateImageFile } from '../helpers/validateImageFile';
import { useObjectUrl } from '../helpers/useObjectUrl';

type UploadStep = {
  key: PhotoPosition | 'review';
  label: string;
  required: boolean;
};

const steps: UploadStep[] = [
  { key: 'front', label: 'Front Photo', required: true },
  { key: 'side', label: 'Side Photo', required: false },
  { key: 'back', label: 'Back Photo', required: false },
  { key: 'review', label: 'Review', required: false }
];

const formatBytes = (value?: number | null) => {
  if (!value || value <= 0) return '';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const toLocalDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTakenAtLabel = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
};

const fileToUploadPhoto = (
  position: PhotoPosition,
  file: File
): StarterUploadRequestPhoto => ({
  position,
  file,
  mimeType: file.type,
  originalFileName: file.name,
  sizeBytes: file.size
});

const StarterPhotosSection = () => {
  const dispatch = useDispatch();

  const {
    hasStarterPhotos,
    starterPhotoSet,
    loadingStarter,
    creatingStarterUploadSession,
    starterUploadSession,
    finalizingStarterPhotos,
    starterError
  } = useAppSelector((s) => s.photos);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [frontPhoto, setFrontPhoto] =
    useState<StarterUploadRequestPhoto | null>(null);
  const [sidePhoto, setSidePhoto] = useState<StarterUploadRequestPhoto | null>(
    null
  );
  const [backPhoto, setBackPhoto] = useState<StarterUploadRequestPhoto | null>(
    null
  );

  const frontPreviewUrl = useObjectUrl(frontPhoto?.file);
  const sidePreviewUrl = useObjectUrl(sidePhoto?.file);
  const backPreviewUrl = useObjectUrl(backPhoto?.file);

  const [starterTakenAt, setStarterTakenAt] = useState(
    toLocalDateInputValue(new Date())
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const hadFinalizeInFlightRef = useRef(false);

  const getInitialStarterTakenAt = useCallback(() => {
    const existingTakenAt = starterPhotoSet?.photos?.[0]?.takenAt;

    if (!existingTakenAt) {
      return toLocalDateInputValue(new Date());
    }

    const date = new Date(existingTakenAt);
    if (Number.isNaN(date.getTime())) {
      return toLocalDateInputValue(new Date());
    }

    return toLocalDateInputValue(date);
  }, [starterPhotoSet?.photos]);

  const clearDialogForm = useCallback(
    (useExistingTakenAt: boolean) => {
      setActiveStep(0);
      setFrontPhoto(null);
      setSidePhoto(null);
      setBackPhoto(null);
      setStarterTakenAt(
        useExistingTakenAt
          ? getInitialStarterTakenAt()
          : toLocalDateInputValue(new Date())
      );
      setLocalError(null);
      setIsUploadingFiles(false);
      dispatch(clearStarterUploadSession());
    },
    [dispatch, getInitialStarterTakenAt]
  );

  const resetDialogState = useCallback(() => {
    hadFinalizeInFlightRef.current = false;
    setDialogOpen(false);
    clearDialogForm(false);
  }, [clearDialogForm]);

  const openDialog = () => {
    hadFinalizeInFlightRef.current = false;
    setDialogOpen(true);
    clearDialogForm(true);
  };

  const selectedPhotos = useMemo(
    () =>
      [frontPhoto, sidePhoto, backPhoto].filter(
        Boolean
      ) as StarterUploadRequestPhoto[],
    [frontPhoto, sidePhoto, backPhoto]
  );

  const isBusy =
    creatingStarterUploadSession || finalizingStarterPhotos || isUploadingFiles;

  const displayError = localError || starterError;

  const currentStep = steps[activeStep];
  const isReviewStep = currentStep?.key === 'review';

  const getPreviewUrlForPosition = useCallback(
    (position: PhotoPosition) => {
      if (position === 'front') return frontPreviewUrl;
      if (position === 'side') return sidePreviewUrl;
      return backPreviewUrl;
    },
    [frontPreviewUrl, sidePreviewUrl, backPreviewUrl]
  );

  const getPhotoForPosition = useCallback(
    (position: PhotoPosition) => {
      if (position === 'front') return frontPhoto;
      if (position === 'side') return sidePhoto;
      return backPhoto;
    },
    [frontPhoto, sidePhoto, backPhoto]
  );

  const setPhotoStateForPosition = useCallback(
    (position: PhotoPosition, photo: StarterUploadRequestPhoto | null) => {
      if (position === 'front') setFrontPhoto(photo);
      if (position === 'side') setSidePhoto(photo);
      if (position === 'back') setBackPhoto(photo);
    },
    []
  );

  const currentPhoto =
    currentStep && currentStep.key !== 'review'
      ? getPhotoForPosition(currentStep.key)
      : null;

  const setPhotoForPosition = async (
    position: PhotoPosition,
    file: File | null
  ) => {
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    try {
      const normalizedFile = await normalizeImageFile(file);
      const nextPhoto = fileToUploadPhoto(position, normalizedFile);

      setPhotoStateForPosition(position, nextPhoto);
      setLocalError(null);
    } catch (err) {
      console.error('[normalizeImageFile] failed', err);

      setLocalError(
        err instanceof Error
          ? `Failed to process image: ${err.message}`
          : 'Failed to process image file'
      );
    }
  };

  const goNext = () => {
    if (!isReviewStep && currentStep?.required && !currentPhoto) {
      setLocalError(`${currentStep.label} is required`);
      return;
    }

    setLocalError(null);

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setLocalError(null);

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleCreateUploadSession = () => {
    if (!frontPhoto) {
      setLocalError('Front photo is required');
      return;
    }

    if (!starterTakenAt) {
      setLocalError('Please choose the date these starter photos were taken');
      return;
    }

    dispatch(
      createStarterUploadSessionRequested({
        photos: selectedPhotos.map((photo) => ({
          position: photo.position,
          mimeType: photo.mimeType,
          originalFileName: photo.originalFileName ?? null,
          sizeBytes: photo.sizeBytes ?? null
        }))
      })
    );
  };

  useEffect(() => {
    if (!dialogOpen || !starterUploadSession || selectedPhotos.length === 0) {
      return;
    }

    let cancelled = false;

    const runUploads = async () => {
      try {
        setIsUploadingFiles(true);
        setLocalError(null);

        for (const upload of starterUploadSession.uploads) {
          const matchingPhoto = selectedPhotos.find(
            (photo) => photo.position === upload.position
          );

          if (!matchingPhoto) {
            throw new Error(`Missing selected file for ${upload.position}`);
          }

          await uploadPhotoToSignedUrl({
            uploadUrl: upload.uploadUrl,
            file: matchingPhoto.file,
            mimeType: matchingPhoto.mimeType
          });
        }

        if (cancelled) return;

        dispatch(
          finalizeStarterPhotosRequested({
            photoSetId: starterUploadSession.photoSetId,
            takenAt: new Date(`${starterTakenAt}T12:00:00`).toISOString(),
            photos: selectedPhotos.map((photo) => ({
              position: photo.position,
              mimeType: photo.mimeType,
              originalFileName: photo.originalFileName ?? null,
              sizeBytes: photo.sizeBytes ?? null
            }))
          })
        );
      } catch (err) {
        if (cancelled) return;

        setLocalError(
          err instanceof Error ? err.message : 'Failed to upload starter photos'
        );
        setIsUploadingFiles(false);
      }
    };

    runUploads();

    return () => {
      cancelled = true;
    };
  }, [
    dialogOpen,
    dispatch,
    selectedPhotos,
    starterTakenAt,
    starterUploadSession
  ]);

  useEffect(() => {
    if (finalizingStarterPhotos) {
      hadFinalizeInFlightRef.current = true;
      return;
    }

    if (
      dialogOpen &&
      hadFinalizeInFlightRef.current &&
      !creatingStarterUploadSession &&
      !isUploadingFiles &&
      hasStarterPhotos
    ) {
      hadFinalizeInFlightRef.current = false;
      resetDialogState();
      dispatch(fetchStarterPhotosRequested());
    }
  }, [
    creatingStarterUploadSession,
    dialogOpen,
    dispatch,
    finalizingStarterPhotos,
    hasStarterPhotos,
    isUploadingFiles,
    resetDialogState
  ]);

  useEffect(() => {
    if (!finalizingStarterPhotos) {
      setIsUploadingFiles(false);
    }
  }, [finalizingStarterPhotos]);

  if (loadingStarter) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant='body2'>Loading starter photos...</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='h6'>Starter Progress Photos</Typography>

          {!hasStarterPhotos ? (
            <>
              <Typography variant='body2' color='text.secondary'>
                Upload your starting photos so you and your coach can track
                visual progress alongside your check-ins.
              </Typography>

              <Button variant='contained' onClick={openDialog}>
                Upload Starter Photos
              </Button>
            </>
          ) : (
            <Stack spacing={2}>
              <Typography variant='body2' color='text.secondary'>
                Your starter photo set has been saved.
              </Typography>

              <Button variant='outlined' onClick={openDialog}>
                Replace Starter Photos
              </Button>

              {starterPhotoSet?.photos?.[0]?.takenAt ? (
                <Typography variant='caption' color='text.secondary'>
                  Taken on{' '}
                  {formatTakenAtLabel(starterPhotoSet.photos[0].takenAt)}
                </Typography>
              ) : null}

              <Stack direction='row' spacing={2} flexWrap='wrap'>
                {starterPhotoSet?.photos.map((photo) => (
                  <Box
                    key={photo.position}
                    sx={{
                      width: 120,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'grey.900',
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.12)'
                      }}
                    >
                      {photo.viewUrl ? (
                        <Box
                          component='img'
                          src={photo.viewUrl}
                          alt={`${photo.position} starter progress`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {photo.position}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Typography
                      variant='caption'
                      sx={{ textTransform: 'capitalize', textAlign: 'center' }}
                    >
                      {photo.position}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={isBusy ? undefined : resetDialogState}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Upload Starter Photos</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((step) => (
                <Step key={step.key}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {!isReviewStep ? (
              <Stack spacing={1.5}>
                <Typography variant='subtitle1'>{currentStep.label}</Typography>

                <Typography variant='body2' color='text.secondary'>
                  {currentStep.required
                    ? 'This photo is required.'
                    : 'This photo is optional. You can upload one or skip it.'}
                </Typography>

                <Button variant='outlined' component='label'>
                  {currentPhoto ? 'Replace Photo' : 'Choose Photo'}
                  <input
                    hidden
                    type='file'
                    accept='image/jpeg,image/png,image/heic,image/heif'
                    onChange={(e) =>
                      setPhotoForPosition(
                        currentStep.key as PhotoPosition,
                        e.target.files?.[0] ?? null
                      )
                    }
                  />
                </Button>

                {currentPhoto ? (
                  <Stack spacing={1}>
                    <Typography variant='body2'>
                      Selected: {currentPhoto.originalFileName}
                    </Typography>

                    <Box
                      sx={{
                        width: 160,
                        height: 160,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.12)',
                        bgcolor: 'grey.900'
                      }}
                    >
                      <Box
                        component='img'
                        src={
                          getPreviewUrlForPosition(
                            currentStep.key as PhotoPosition
                          ) ?? undefined
                        }
                        alt={`${currentStep.label} preview`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    No photo selected
                  </Typography>
                )}

                {displayError && (
                  <Typography variant='body2' color='error'>
                    {displayError}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography variant='subtitle1'>
                  Review Starter Photos
                </Typography>

                <Typography variant='body2' color='text.secondary'>
                  Please review the photos you selected before submitting.
                </Typography>

                <TextField
                  label='Taken on'
                  type='date'
                  value={starterTakenAt}
                  onChange={(e) => {
                    setStarterTakenAt(e.target.value);
                    setLocalError(null);
                  }}
                  InputLabelProps={{ shrink: true }}
                  helperText='Use the date these starter photos were actually taken.'
                  fullWidth
                />

                <Stack direction='row' spacing={2} flexWrap='wrap'>
                  {steps
                    .filter((step) => step.key !== 'review')
                    .map((step) => {
                      const photo = getPhotoForPosition(
                        step.key as PhotoPosition
                      );

                      return (
                        <Box
                          key={step.key}
                          sx={{
                            width: 150,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                          }}
                        >
                          <Box
                            sx={{
                              width: 150,
                              height: 150,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'rgba(255,255,255,0.12)',
                              bgcolor: 'grey.900',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {photo ? (
                              <Box
                                component='img'
                                src={
                                  getPreviewUrlForPosition(
                                    step.key as PhotoPosition
                                  ) ?? undefined
                                }
                                alt={`${step.label} preview`}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                            ) : (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ textTransform: 'capitalize' }}
                              >
                                Skipped
                              </Typography>
                            )}
                          </Box>

                          <Stack spacing={0.25}>
                            <Typography
                              variant='caption'
                              sx={{
                                textTransform: 'capitalize',
                                textAlign: 'center'
                              }}
                            >
                              {step.key}
                            </Typography>

                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{ textAlign: 'center' }}
                            >
                              {photo?.originalFileName ?? 'No photo selected'}
                            </Typography>

                            {photo?.sizeBytes ? (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ textAlign: 'center' }}
                              >
                                {formatBytes(photo.sizeBytes)}
                              </Typography>
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                </Stack>

                {displayError && (
                  <Typography variant='body2' color='error'>
                    {displayError}
                  </Typography>
                )}
              </Stack>
            )}

            <Stack spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                Selected so far:
              </Typography>

              <Stack direction='row' spacing={1} flexWrap='wrap'>
                {steps
                  .filter((step) => step.key !== 'review')
                  .map((step) => {
                    const selected = getPhotoForPosition(
                      step.key as PhotoPosition
                    );

                    return (
                      <Box
                        key={step.key}
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 999,
                          border: '1px solid',
                          borderColor: selected
                            ? 'rgba(42, 201, 184, 0.45)'
                            : 'rgba(255,255,255,0.12)',
                          bgcolor: selected
                            ? 'rgba(42, 201, 184, 0.16)'
                            : 'rgba(255,255,255,0.04)'
                        }}
                      >
                        <Typography
                          variant='caption'
                          sx={{
                            textTransform: 'capitalize',
                            color: selected ? 'primary.main' : 'text.secondary'
                          }}
                        >
                          {step.key}
                        </Typography>
                      </Box>
                    );
                  })}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={resetDialogState} disabled={isBusy}>
            Cancel
          </Button>

          {activeStep > 0 && (
            <Button
              onClick={() => {
                setLocalError(null);
                setActiveStep((prev) => prev - 1);
              }}
              disabled={isBusy}
            >
              Back
            </Button>
          )}

          {!isReviewStep &&
            !currentStep.required &&
            activeStep < steps.length - 1 && (
              <Button onClick={handleSkip} disabled={isBusy}>
                Skip
              </Button>
            )}

          {!isReviewStep ? (
            <Button
              variant='contained'
              onClick={goNext}
              disabled={(currentStep?.required && !currentPhoto) || isBusy}
            >
              Next
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={handleCreateUploadSession}
              disabled={!frontPhoto || !starterTakenAt || isBusy}
            >
              {isBusy ? 'Uploading...' : 'Submit'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StarterPhotosSection;
