import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Slider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  kgToLbsRounded,
  lbsToKgRounded
} from '../../../utils/conversions/weight';
import { formatWeight, toIsoDateInputValue } from '../helpers';
import {
  clearLastCreatedCheckInId,
  clearSelectedDateCheckIn,
  closeCheckInRequested,
  createCheckInRequested,
  fetchCheckInByDateRequested,
  reopenCheckInRequested,
  saveExerciseSelectionRequested,
  type CreateCheckInInput,
  type MappedCheckIn
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
  initialDate?: string | null;
  initialItem?: MappedCheckIn | null;
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

const AddCheckInDialog = ({
  open,
  onClose,
  initialDate,
  initialItem
}: AddCheckInDialogProps) => {
  const dispatch = useAppDispatch();
  const isNative = Capacitor.isNativePlatform();
  const previousUpdatingLifecycleRef = useRef(false);
  const previousSavingExerciseSelectionRef = useRef(false);

  const { weightUnitPref } = useAppSelector(selectUserUnitPrefs);
  const {
    creating,
    updatingLifecycle,
    savingExerciseSelection,
    error: checkInError,
    lastCreatedCheckInId,
    selectedDateItem,
    selectedDateSuggestedExerciseSessions,
    loadingSelectedDate,
    selectedDateError
  } = useAppSelector((s) => s.checkIns);

  const {
    creatingProgressUploadSession,
    progressUploadSession,
    finalizingProgressPhotos,
    progressError: photosError
  } = useAppSelector((s) => s.photos);

  const today = useMemo(() => toIsoDateInputValue(new Date()), []);
  const startingDate = initialDate ?? today;

  const [dateValue, setDateValue] = useState<string>(startingDate);
  const [weightDisplay, setWeightDisplay] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [includeProgressPhotos, setIncludeProgressPhotos] = useState(false);

  const [includedExerciseSessionIds, setIncludedExerciseSessionIds] = useState<
    string[]
  >([]);
  const [excludedExerciseSessionIds, setExcludedExerciseSessionIds] = useState<
    string[]
  >([]);

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
  const [pendingCheckInPayload, setPendingCheckInPayload] =
    useState<CreateCheckInInput | null>(null);
  const [currentProgressPhotoSetId, setCurrentProgressPhotoSetId] = useState<
    string | null
  >(null);
  const [checkInRequestedAfterFinalize, setCheckInRequestedAfterFinalize] =
    useState(false);
  const [energyLevel, setEnergyLevel] = useState<string>('');
  const [onTrackLevel, setOnTrackLevel] = useState<string>('');

  const resetForm = useCallback(() => {
    setDateValue(initialDate ?? toIsoDateInputValue(new Date()));
    setWeightDisplay('');
    setNotes('');
    setEnergyLevel('');
    setOnTrackLevel('');
    setIncludeProgressPhotos(false);
    setIncludedExerciseSessionIds([]);
    setExcludedExerciseSessionIds([]);
    setActiveStep(0);
    setFrontPhoto(null);
    setSidePhoto(null);
    setBackPhoto(null);
    setLocalError(null);
    setIsUploadingFiles(false);
    setProgressFinalizeStarted(false);
    setPendingCheckInPayload(null);
    setCurrentProgressPhotoSetId(null);
    setCheckInRequestedAfterFinalize(false);
    dispatch(clearLastCreatedCheckInId());
    dispatch(clearProgressUploadSession());
    dispatch(clearSelectedDateCheckIn());
  }, [dispatch, initialDate]);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) return;
    if (!initialDate) return;

    setDateValue(initialDate);
  }, [initialDate, open]);

  useEffect(() => {
    if (!open) return;

    const fetchDate = initialDate ?? dateValue;
    if (!fetchDate) return;

    dispatch(fetchCheckInByDateRequested({ date: fetchDate }));
  }, [dateValue, dispatch, initialDate, open]);

  useEffect(() => {
    if (!open) return;

    const sourceItem = selectedDateItem ?? initialItem ?? null;

    const displayWeight =
      sourceItem?.weightKg != null
        ? weightUnitPref === 'lbs'
          ? String(kgToLbsRounded(sourceItem.weightKg, 1))
          : String(sourceItem.weightKg)
        : '';

    setWeightDisplay(displayWeight);
    setNotes(sourceItem?.notes ?? '');
    setIncludeProgressPhotos(Boolean(sourceItem?.hasPhotos));

    setIncludedExerciseSessionIds(sourceItem?.includedExerciseSessionIds ?? []);
    setExcludedExerciseSessionIds(sourceItem?.excludedExerciseSessionIds ?? []);
    setEnergyLevel(
      sourceItem?.energyLevel != null ? String(sourceItem.energyLevel) : ''
    );
    setOnTrackLevel(
      sourceItem?.onTrackLevel != null ? String(sourceItem.onTrackLevel) : ''
    );
  }, [initialItem, open, selectedDateItem, weightUnitPref]);

  useEffect(() => {
    const wasUpdatingLifecycle = previousUpdatingLifecycleRef.current;

    if (
      open &&
      wasUpdatingLifecycle &&
      !updatingLifecycle &&
      dateValue &&
      !checkInError
    ) {
      dispatch(fetchCheckInByDateRequested({ date: dateValue }));
    }

    previousUpdatingLifecycleRef.current = updatingLifecycle;
  }, [checkInError, dateValue, dispatch, open, updatingLifecycle]);

  useEffect(() => {
    const wasSavingExerciseSelection =
      previousSavingExerciseSelectionRef.current;

    if (
      open &&
      wasSavingExerciseSelection &&
      !savingExerciseSelection &&
      dateValue &&
      !checkInError
    ) {
      dispatch(fetchCheckInByDateRequested({ date: dateValue }));
    }

    previousSavingExerciseSelectionRef.current = savingExerciseSelection;
  }, [checkInError, dateValue, dispatch, open, savingExerciseSelection]);

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

  const buildCreateCheckInPayload = (): CreateCheckInInput | null => {
    const w = Number(weightDisplay);
    if (!Number.isFinite(w) || w <= 0) {
      setLocalError('Please enter a valid weight');
      return null;
    }

    if (includeProgressPhotos && !frontPhoto && !selectedDateItem?.hasPhotos) {
      setLocalError(
        'Front photo is required when progress photos are included'
      );
      return null;
    }

    const weightKg =
      weightUnitPref === 'lbs' ? lbsToKgRounded(w, 2) : Number(w.toFixed(2));

    const recordedAtIso = (() => {
      const now = new Date();

      if (!dateValue) {
        return now.toISOString();
      }

      const [year, month, day] = dateValue.split('-').map(Number);

      const recordedAt = new Date(
        year,
        (month ?? 1) - 1,
        day ?? 1,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
      );

      return recordedAt.toISOString();
    })();

    const parsedEnergy =
      energyLevel && energyLevel.trim() !== ''
        ? Number(energyLevel)
        : undefined;

    const parsedOnTrackLevel =
      onTrackLevel && onTrackLevel.trim() !== ''
        ? Number(onTrackLevel)
        : undefined;

    return {
      representedDate: dateValue,
      recordedAt: recordedAtIso,
      weightKg,
      notes: notes.trim() ? notes.trim() : undefined,
      energyLevel: parsedEnergy,
      onTrackLevel: parsedOnTrackLevel
    };
  };

  const handleSave = () => {
    const payload = buildCreateCheckInPayload();
    if (!payload) return;

    setLocalError(null);

    if (!includeProgressPhotos || selectedPhotos.length === 0) {
      dispatch(createCheckInRequested(payload));
      return;
    }

    setPendingCheckInPayload(payload);
    setProgressFinalizeStarted(false);
    setCurrentProgressPhotoSetId(null);
    setCheckInRequestedAfterFinalize(false);

    dispatch(
      createProgressUploadSessionRequested({
        photos: selectedPhotos.map((photo) => ({
          position: photo.position,
          mimeType: photo.mimeType,
          originalFileName: photo.originalFileName ?? null,
          sizeBytes: photo.sizeBytes ?? null
        }))
      })
    );
  };

  const handleCloseCheckIn = () => {
    if (!selectedDateItem?.id) return;
    dispatch(closeCheckInRequested({ id: selectedDateItem.id }));
  };

  const handleReopenCheckIn = () => {
    if (!selectedDateItem?.id) return;
    dispatch(reopenCheckInRequested({ id: selectedDateItem.id }));
  };

  const toggleExerciseIncluded = (sessionId: string) => {
    setLocalError(null);

    setIncludedExerciseSessionIds((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );

    setExcludedExerciseSessionIds((prev) =>
      prev.filter((id) => id !== sessionId)
    );
  };

  const toggleExerciseExcluded = (sessionId: string) => {
    setLocalError(null);

    setExcludedExerciseSessionIds((prev) =>
      prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId]
    );

    setIncludedExerciseSessionIds((prev) =>
      prev.filter((id) => id !== sessionId)
    );
  };

  const handleSaveExerciseSelection = () => {
    if (!selectedDateItem?.id) return;

    dispatch(
      saveExerciseSelectionRequested({
        id: selectedDateItem.id,
        autoSuggestedExerciseSessionIds:
          selectedDateSuggestedExerciseSessions.map((session) => session.id),
        includedExerciseSessionIds,
        excludedExerciseSessionIds
      })
    );
  };

  useEffect(() => {
    if (!open || !progressUploadSession) return;
    if (selectedPhotos.length === 0) return;

    let cancelled = false;

    const runUploads = async () => {
      try {
        setIsUploadingFiles(true);
        setLocalError(null);
        setCurrentProgressPhotoSetId(progressUploadSession.photoSetId);

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
            photoSetId: progressUploadSession.photoSetId,
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

        console.error('[AddCheckInDialog] progress photo upload failed', {
          photoSetId: progressUploadSession.photoSetId,
          error: err instanceof Error ? err.message : String(err)
        });

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
    if (!includeProgressPhotos) return;
    if (!progressFinalizeStarted) return;
    if (finalizingProgressPhotos) return;
    if (photosError) return;
    if (!pendingCheckInPayload) return;
    if (!currentProgressPhotoSetId) return;
    if (checkInRequestedAfterFinalize) return;

    setCheckInRequestedAfterFinalize(true);

    dispatch(
      createCheckInRequested({
        ...pendingCheckInPayload,
        progressPhotoSetId: currentProgressPhotoSetId
      })
    );
  }, [
    checkInRequestedAfterFinalize,
    currentProgressPhotoSetId,
    dispatch,
    finalizingProgressPhotos,
    includeProgressPhotos,
    open,
    pendingCheckInPayload,
    photosError,
    progressFinalizeStarted
  ]);

  useEffect(() => {
    if (!open) return;
    if (!lastCreatedCheckInId) return;
    if (creating) return;
    if (checkInError) return;

    if (includeProgressPhotos) {
      if (photosError) return;
      if (localError) return;
    }

    onClose();
  }, [
    checkInError,
    creating,
    includeProgressPhotos,
    lastCreatedCheckInId,
    localError,
    onClose,
    open,
    photosError
  ]);

  useEffect(() => {
    if (!finalizingProgressPhotos) {
      setIsUploadingFiles(false);
    }
  }, [finalizingProgressPhotos]);

  const disableClose =
    creating ||
    updatingLifecycle ||
    savingExerciseSelection ||
    creatingProgressUploadSession ||
    finalizingProgressPhotos ||
    isUploadingFiles;

  function formatWeightSourceLabel(
    item: MappedCheckIn | null | undefined
  ): string | null {
    if (!item) return null;

    if (item.raw && typeof item.raw === 'object') {
      const raw = item.raw as {
        source?: {
          appSourceName?: string | null;
          type?: string | null;
        };
        sections?: {
          daily?: {
            body?: {
              weightKg?: {
                appleHealth?: {
                  appSourceName?: string | null;
                } | null;
              } | null;
            } | null;
          } | null;
        };
      };

      const appleHealthSourceName =
        raw.sections?.daily?.body?.weightKg?.appleHealth?.appSourceName;

      if (appleHealthSourceName) return appleHealthSourceName;
      if (raw.sections?.daily?.body?.weightKg?.appleHealth)
        return 'Apple Health';
      if (raw.source?.appSourceName) return raw.source.appSourceName;
      if (raw.source?.type === 'apple_health') return 'Apple Health';
    }

    if (item.weightSource === 'manual') return 'Manual';
    if (item.weightSource === 'apple_health') return 'Apple Health';
    if (item.weightSource === 'legacy') return 'Legacy';

    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={disableClose ? undefined : onClose}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>
        {selectedDateItem ? 'Edit Daily Check-in' : 'Add Check-in'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label='Date'
            type='date'
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {loadingSelectedDate ? (
            <Stack direction='row' spacing={1} alignItems='center'>
              <CircularProgress size={16} />
              <Typography variant='body2' color='text.secondary'>
                Loading check-in for selected date...
              </Typography>
            </Stack>
          ) : null}

          {selectedDateItem ? (
            <Stack direction='row' spacing={1} alignItems='center'>
              <Typography variant='caption' color='text.secondary'>
                Status: {selectedDateItem.lifecycleState}
              </Typography>

              {selectedDateItem.lifecycleState === 'open' ? (
                <Button
                  size='small'
                  variant='outlined'
                  onClick={handleCloseCheckIn}
                  disabled={disableClose}
                >
                  Close
                </Button>
              ) : (
                <Button
                  size='small'
                  variant='outlined'
                  onClick={handleReopenCheckIn}
                  disabled={disableClose}
                >
                  Reopen
                </Button>
              )}
            </Stack>
          ) : null}

          {selectedDateItem &&
          selectedDateSuggestedExerciseSessions.length > 0 ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.03)'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent='space-between'
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1}
                sx={{ mb: 1 }}
              >
                <Typography variant='subtitle2'>Suggested Activity</Typography>

                {selectedDateItem.isEditable ? (
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={handleSaveExerciseSelection}
                    disabled={disableClose}
                  >
                    {savingExerciseSelection
                      ? 'Saving...'
                      : 'Save Activity Selection'}
                  </Button>
                ) : null}
              </Stack>

              <Stack spacing={0.75}>
                {selectedDateSuggestedExerciseSessions.map((session) => {
                  const time = session.performedAt
                    ? new Date(session.performedAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit'
                      })
                    : null;

                  const label = session.name ?? 'Exercise Session';
                  const durationMinutes =
                    session.metrics?.durationMinutes ?? null;

                  const isIncluded = includedExerciseSessionIds.includes(
                    session.id
                  );
                  const isExcluded = excludedExerciseSessionIds.includes(
                    session.id
                  );

                  return (
                    <Box
                      key={session.id}
                      sx={{
                        px: 1,
                        py: 0.9,
                        borderRadius: 1,
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction='row' justifyContent='space-between'>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {label}
                          </Typography>

                          {time ? (
                            <Typography
                              variant='caption'
                              sx={{ color: 'rgba(255,255,255,0.6)' }}
                            >
                              {time}
                            </Typography>
                          ) : null}
                        </Stack>

                        {durationMinutes ? (
                          <Typography
                            variant='caption'
                            sx={{ color: 'rgba(255,255,255,0.6)' }}
                          >
                            {durationMinutes} min
                          </Typography>
                        ) : null}

                        <Stack direction='row' spacing={1} flexWrap='wrap'>
                          <Button
                            size='small'
                            variant={isIncluded ? 'contained' : 'outlined'}
                            onClick={() => toggleExerciseIncluded(session.id)}
                            disabled={
                              disableClose ||
                              Boolean(
                                selectedDateItem && !selectedDateItem.isEditable
                              )
                            }
                          >
                            {isIncluded ? 'Included' : 'Include'}
                          </Button>

                          <Button
                            size='small'
                            color='inherit'
                            variant={isExcluded ? 'contained' : 'outlined'}
                            onClick={() => toggleExerciseExcluded(session.id)}
                            disabled={
                              disableClose ||
                              Boolean(
                                selectedDateItem && !selectedDateItem.isEditable
                              )
                            }
                          >
                            {isExcluded ? 'Excluded' : 'Exclude'}
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ) : null}

          {(() => {
            const item = selectedDateItem ?? initialItem;
            const label = formatWeightSourceLabel(item);

            if (!label) return null;

            return (
              <Typography variant='caption' color='text.secondary'>
                Source: {label}
                {item?.hasWeightConflict
                  ? ' • Multiple weights recorded this day'
                  : ''}
              </Typography>
            );
          })()}

          <TextField
            label={`Weight (${weightUnitPref})`}
            type='number'
            value={weightDisplay}
            onChange={(e) => setWeightDisplay(e.target.value)}
            inputProps={{ min: 0, step: '0.1' }}
            autoFocus
            disabled={Boolean(
              (selectedDateItem ?? initialItem) &&
                (!(selectedDateItem ?? initialItem)?.isEditable ||
                  (selectedDateItem ?? initialItem)?.weightSource ===
                    'apple_health' ||
                  (selectedDateItem ?? initialItem)?.weightSource === 'legacy')
            )}
          />

          <Box>
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
              Energy Level
            </Typography>

            <Typography variant='caption' color='text.secondary'>
              How was your energy today?
            </Typography>

            <Slider
              value={energyLevel ? Number(energyLevel) : 5}
              onChange={(_, value) => setEnergyLevel(String(value))}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay='on'
              disabled={Boolean(
                selectedDateItem && !selectedDateItem.isEditable
              )}
              sx={{ mt: 2 }}
            />

            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='caption' color='text.secondary'>
                1
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                10
              </Typography>
            </Stack>
          </Box>
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
              How on track were you?
            </Typography>

            <Typography variant='caption' color='text.secondary'>
              How well did you stick to your plan today?
            </Typography>

            <Slider
              value={onTrackLevel ? Number(onTrackLevel) : 5}
              onChange={(_, value) => setOnTrackLevel(String(value))}
              min={1}
              max={10}
              step={1}
              marks
              valueLabelDisplay='on'
              disabled={Boolean(
                selectedDateItem && !selectedDateItem.isEditable
              )}
              sx={{ mt: 2 }}
            />

            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='caption' color='text.secondary'>
                1
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                10
              </Typography>
            </Stack>
          </Box>

          {Boolean(
            (selectedDateItem ?? initialItem)?.alternateWeights?.length
          ) && (
            <Stack spacing={0.5}>
              <Typography variant='caption' color='text.secondary'>
                Other weights recorded this day:
              </Typography>

              {(selectedDateItem ?? initialItem)?.alternateWeights?.map(
                (weight, idx) => (
                  <Typography
                    key={`${weight.source}-${weight.weightKg}-${idx}`}
                    variant='caption'
                    color='text.secondary'
                  >
                    {weight.source === 'manual'
                      ? 'Manual'
                      : weight.source === 'apple_health'
                      ? 'Apple Health'
                      : 'Legacy'}
                    : {formatWeight(weight.weightKg, weightUnitPref)}{' '}
                    {weightUnitPref}
                  </Typography>
                )
              )}
            </Stack>
          )}

          <TextField
            label='Notes (optional)'
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            disabled={Boolean(selectedDateItem && !selectedDateItem.isEditable)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={includeProgressPhotos}
                onChange={(e) => {
                  setIncludeProgressPhotos(e.target.checked);
                  setLocalError(null);
                }}
                disabled={Boolean(
                  selectedDateItem && !selectedDateItem.isEditable
                )}
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
                          disabled={
                            disableClose ||
                            Boolean(
                              selectedDateItem && !selectedDateItem.isEditable
                            )
                          }
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
                          disabled={
                            disableClose ||
                            Boolean(
                              selectedDateItem && !selectedDateItem.isEditable
                            )
                          }
                        >
                          Choose From Library
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant='contained'
                        component='label'
                        disabled={
                          disableClose ||
                          Boolean(
                            selectedDateItem && !selectedDateItem.isEditable
                          )
                        }
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

          {selectedDateError || localError || checkInError || photosError ? (
            <Typography variant='body2' color='error'>
              {selectedDateError || localError || checkInError || photosError}
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
                currentStep.required && !currentPhoto
                  ? true
                  : disableClose ||
                    Boolean(selectedDateItem && !selectedDateItem.isEditable)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={handleSave}
              disabled={
                disableClose ||
                Boolean(selectedDateItem && !selectedDateItem.isEditable)
              }
            >
              {disableClose ? 'Saving...' : 'Save'}
            </Button>
          )
        ) : (
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={
              disableClose ||
              Boolean(selectedDateItem && !selectedDateItem.isEditable)
            }
          >
            {disableClose ? 'Saving...' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddCheckInDialog;
