import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { lbsToKgRounded } from '../../../utils/conversions/weight';
import { toIsoDateInputValue } from '../helpers';
import {
  clearLastCreatedCheckInId,
  createCheckInRequested
} from '../redux/checkInsSlice';
import { selectUserUnitPrefs } from '../../nutritionCalculator/redux/nutritionCalculatorSlice';
import {
  clearProgressUploadSession,
  createProgressUploadSessionRequested,
  finalizeProgressPhotosRequested,
  type PhotoPosition,
  type StarterUploadRequestPhoto
} from '../../photos/redux/photosSlice';
import { uploadPhotoToSignedUrl } from '../../photos/helpers/uploadPhotoToSignedUrl';
import { Capacitor } from '@capacitor/core';

type AddCheckInDialogProps = {
  open: boolean;
  onClose: () => void;
};

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

const formatBytes = (value?: number | null) => {
  if (!value || value <= 0) return '';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const dataUrlToFile = async (
  dataUrl: string,
  fileName: string
): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';
  return new File([blob], fileName, { type: mimeType });
};

const createPhotoFileName = (position: PhotoPosition) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `checkin-${position}-${stamp}.jpeg`;
};

const AddCheckInDialog = ({ open, onClose }: AddCheckInDialogProps) => {
  const dispatch = useAppDispatch();
  const isNative = Capacitor.isNativePlatform();

  const { weightUnitPref } = useAppSelector(selectUserUnitPrefs);
  const {
    creating,
    error: checkInError,
    lastCreatedCheckInId
  } = useAppSelector((s) => s.checkIns);

  const {
    creatingProgressUploadSession,
    progressUploadSession,
    finalizingProgressPhotos,
    error: photosError
  } = useAppSelector((s) => s.photos);

  const today = useMemo(() => toIsoDateInputValue(new Date()), []);

  const [dateValue, setDateValue] = useState<string>(today);
  const [weightDisplay, setWeightDisplay] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [includeProgressPhotos, setIncludeProgressPhotos] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [frontPhoto, setFrontPhoto] =
    useState<StarterUploadRequestPhoto | null>(null);
  const [sidePhoto, setSidePhoto] = useState<StarterUploadRequestPhoto | null>(
    null
  );
  const [backPhoto, setBackPhoto] = useState<StarterUploadRequestPhoto | null>(
    null
  );

  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [progressFinalizeStarted, setProgressFinalizeStarted] = useState(false);
  const [
    progressUploadRequestedForCheckInId,
    setProgressUploadRequestedForCheckInId
  ] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setDateValue(toIsoDateInputValue(new Date()));
    setWeightDisplay('');
    setNotes('');
    setIncludeProgressPhotos(false);
    setActiveStep(0);
    setFrontPhoto(null);
    setSidePhoto(null);
    setBackPhoto(null);
    setLocalError(null);
    setIsUploadingFiles(false);
    setProgressFinalizeStarted(false);
    setProgressUploadRequestedForCheckInId(null);
    dispatch(clearLastCreatedCheckInId());
    dispatch(clearProgressUploadSession());
  }, [dispatch]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const selectedPhotos = useMemo(
    () =>
      [frontPhoto, sidePhoto, backPhoto].filter(
        Boolean
      ) as StarterUploadRequestPhoto[],
    [frontPhoto, sidePhoto, backPhoto]
  );

  const currentStep = steps[activeStep];
  const isReviewStep = currentStep?.key === 'review';

  const currentPhoto =
    currentStep?.key === 'front'
      ? frontPhoto
      : currentStep?.key === 'side'
      ? sidePhoto
      : currentStep?.key === 'back'
      ? backPhoto
      : null;

  const setPhotoForPosition = (position: PhotoPosition, file: File | null) => {
    if (!file) return;

    const nextPhoto = fileToUploadPhoto(position, file);

    if (position === 'front') setFrontPhoto(nextPhoto);
    if (position === 'side') setSidePhoto(nextPhoto);
    if (position === 'back') setBackPhoto(nextPhoto);

    setLocalError(null);
  };

  const handleFileInputChange = (
    position: PhotoPosition,
    file: File | null
  ) => {
    setPhotoForPosition(position, file);
  };

  const handleTakePhoto = async (position: PhotoPosition) => {
    try {
      setLocalError(null);

      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (!photo.dataUrl) {
        throw new Error('No photo was captured.');
      }

      const file = await dataUrlToFile(
        photo.dataUrl,
        createPhotoFileName(position)
      );

      setPhotoForPosition(position, file);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to take photo';

      if (
        message.toLowerCase().includes('cancel') ||
        message.toLowerCase().includes('canceled')
      ) {
        return;
      }

      setLocalError(message);
    }
  };

  const handleChooseFromLibrary = async (position: PhotoPosition) => {
    try {
      setLocalError(null);

      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (!photo.dataUrl) {
        throw new Error('No photo was selected.');
      }

      const file = await dataUrlToFile(
        photo.dataUrl,
        createPhotoFileName(position)
      );

      setPhotoForPosition(position, file);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to choose photo';

      if (
        message.toLowerCase().includes('cancel') ||
        message.toLowerCase().includes('canceled')
      ) {
        return;
      }

      setLocalError(message);
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

  const handleSave = () => {
    const w = Number(weightDisplay);
    if (!Number.isFinite(w) || w <= 0) {
      setLocalError('Please enter a valid weight');
      return;
    }

    if (includeProgressPhotos && !frontPhoto) {
      setLocalError(
        'Front photo is required when progress photos are included'
      );
      return;
    }

    const recordedAtIso = new Date().toISOString();

    const weightKg =
      weightUnitPref === 'lbs' ? lbsToKgRounded(w, 2) : Number(w.toFixed(2));

    dispatch(
      createCheckInRequested({
        recordedAt: recordedAtIso,
        weightKg,
        notes: notes.trim() ? notes.trim() : undefined
      })
    );

    setLocalError(null);
  };

  useEffect(() => {
    if (!open) return;
    if (!lastCreatedCheckInId) return;

    if (!includeProgressPhotos) {
      return;
    }

    if (progressUploadRequestedForCheckInId === lastCreatedCheckInId) {
      return;
    }

    setProgressUploadRequestedForCheckInId(lastCreatedCheckInId);

    dispatch(
      createProgressUploadSessionRequested({
        checkInId: lastCreatedCheckInId,
        photos: selectedPhotos.map((photo) => ({
          position: photo.position,
          mimeType: photo.mimeType,
          originalFileName: photo.originalFileName ?? null,
          sizeBytes: photo.sizeBytes ?? null
        }))
      })
    );
  }, [
    dispatch,
    includeProgressPhotos,
    lastCreatedCheckInId,
    open,
    progressUploadRequestedForCheckInId,
    selectedPhotos
  ]);

  useEffect(() => {
    if (!open || !progressUploadSession) return;
    if (selectedPhotos.length === 0) return;

    let cancelled = false;

    const runUploads = async () => {
      try {
        setIsUploadingFiles(true);
        setLocalError(null);

        for (const upload of progressUploadSession.uploads) {
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

        setProgressFinalizeStarted(true);

        dispatch(
          finalizeProgressPhotosRequested({
            checkInId: progressUploadSession.checkInId,
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
          err instanceof Error
            ? err.message
            : 'Failed to upload progress photos'
        );
        setIsUploadingFiles(false);
      }
    };

    runUploads();

    return () => {
      cancelled = true;
    };
  }, [dispatch, open, progressUploadSession, selectedPhotos]);

  useEffect(() => {
    if (!open) return;

    if (
      !includeProgressPhotos &&
      lastCreatedCheckInId &&
      !creating &&
      !checkInError
    ) {
      onClose();
    }
  }, [
    checkInError,
    creating,
    includeProgressPhotos,
    lastCreatedCheckInId,
    onClose,
    open
  ]);

  useEffect(() => {
    if (!open) return;

    if (
      includeProgressPhotos &&
      progressFinalizeStarted &&
      !finalizingProgressPhotos &&
      !photosError &&
      !checkInError
    ) {
      onClose();
    }
  }, [
    checkInError,
    finalizingProgressPhotos,
    includeProgressPhotos,
    onClose,
    open,
    photosError,
    progressFinalizeStarted
  ]);

  useEffect(() => {
    if (!finalizingProgressPhotos) {
      setIsUploadingFiles(false);
    }
  }, [finalizingProgressPhotos]);

  const disableClose =
    creating ||
    creatingProgressUploadSession ||
    finalizingProgressPhotos ||
    isUploadingFiles;

  return (
    <Dialog
      open={open}
      onClose={disableClose ? undefined : onClose}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>Add Check-in</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label='Date'
            type='date'
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label={`Weight (${weightUnitPref})`}
            type='number'
            value={weightDisplay}
            onChange={(e) => setWeightDisplay(e.target.value)}
            inputProps={{ min: 0, step: '0.1' }}
            autoFocus
          />

          <TextField
            label='Notes (optional)'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={includeProgressPhotos}
                onChange={(e) => {
                  setIncludeProgressPhotos(e.target.checked);
                  setLocalError(null);
                }}
              />
            }
            label='Include progress photos'
          />

          {includeProgressPhotos ? (
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
                  <Typography variant='subtitle1'>
                    {currentStep.label}
                  </Typography>

                  <Typography variant='body2' color='text.secondary'>
                    {currentStep.required
                      ? 'This photo is required.'
                      : 'This photo is optional. You can upload one or skip it.'}
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    {isNative ? (
                      <>
                        <Button
                          variant='contained'
                          onClick={() =>
                            handleTakePhoto(currentStep.key as PhotoPosition)
                          }
                          disabled={disableClose}
                        >
                          {currentPhoto ? 'Retake Photo' : 'Take Photo'}
                        </Button>

                        <Button
                          variant='outlined'
                          onClick={() =>
                            handleChooseFromLibrary(
                              currentStep.key as PhotoPosition
                            )
                          }
                          disabled={disableClose}
                        >
                          Choose From Library
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant='contained'
                        component='label'
                        disabled={disableClose}
                      >
                        {currentPhoto ? 'Replace Photo' : 'Choose Photo'}
                        <input
                          hidden
                          type='file'
                          accept='image/jpeg,image/png'
                          onChange={(e) =>
                            handleFileInputChange(
                              currentStep.key as PhotoPosition,
                              e.target.files?.[0] ?? null
                            )
                          }
                        />
                      </Button>
                    )}
                  </Stack>

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
                          src={URL.createObjectURL(currentPhoto.file)}
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
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Typography variant='subtitle1'>
                    Review Progress Photos
                  </Typography>

                  <Typography variant='body2' color='text.secondary'>
                    Please review the photos you selected before saving.
                  </Typography>

                  <Stack direction='row' spacing={2} flexWrap='wrap'>
                    {steps
                      .filter((step) => step.key !== 'review')
                      .map((step) => {
                        const photo =
                          step.key === 'front'
                            ? frontPhoto
                            : step.key === 'side'
                            ? sidePhoto
                            : backPhoto;

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
                                  src={URL.createObjectURL(photo.file)}
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
                      const selected =
                        step.key === 'front'
                          ? frontPhoto
                          : step.key === 'side'
                          ? sidePhoto
                          : backPhoto;

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
                              color: selected
                                ? 'primary.main'
                                : 'text.secondary'
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
          ) : null}

          {localError || checkInError || photosError ? (
            <Typography variant='body2' color='error'>
              {localError || checkInError || photosError}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={disableClose}>
          Cancel
        </Button>

        {includeProgressPhotos && activeStep > 0 ? (
          <Button
            onClick={() => {
              setLocalError(null);
              setActiveStep((prev) => prev - 1);
            }}
            disabled={disableClose}
          >
            Back
          </Button>
        ) : null}

        {includeProgressPhotos &&
        !isReviewStep &&
        !currentStep.required &&
        activeStep < steps.length - 1 ? (
          <Button onClick={handleSkip} disabled={disableClose}>
            Skip
          </Button>
        ) : null}

        {includeProgressPhotos ? (
          !isReviewStep ? (
            <Button
              variant='contained'
              onClick={goNext}
              disabled={
                currentStep.required && !currentPhoto ? true : disableClose
              }
            >
              Next
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={handleSave}
              disabled={disableClose}
            >
              {disableClose ? 'Saving...' : 'Save'}
            </Button>
          )
        ) : (
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={disableClose}
          >
            {disableClose ? 'Saving...' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddCheckInDialog;
