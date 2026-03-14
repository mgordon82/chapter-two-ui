import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Divider,
  Paper,
  Stack,
  Typography
} from '@mui/material';

import { useAppSelector } from '../../../app/hooks';
import { getAccessToken } from '../../../auth/helpers/getAccessToken';
import type { CheckIn } from '../redux/checkInsSlice';

type CheckInPhotosDialogProps = {
  open: boolean;
  onClose: () => void;
  checkIn: CheckIn | null;
};

type PhotoComparisonAnalysis = {
  summary: string;
  notableProgress: string[];
  likelySignals: string[];
  nextFocusAreas: string[];
  encouragement: string;
  confidenceNote: string;
  model?: string | null;
  generatedAt?: string | null;
};

type PhotoComparisonPair = {
  position: 'front' | 'side' | 'back';
  starter: {
    position: 'front' | 'side' | 'back';
    storageKey: string;
    mimeType: string;
    viewUrl: string;
    takenAt?: string | null;
  };
  progress: {
    position: 'front' | 'side' | 'back';
    storageKey: string;
    mimeType: string;
    viewUrl: string;
  };
};

type PhotoComparisonResponse = {
  ok: true;
  cached: boolean;
  checkIn: {
    id: string;
    recordedAt: string;
  };
  comparison: {
    pairs: PhotoComparisonPair[];
    comparedPositions?: Array<'front' | 'side' | 'back'>;
    daysBetween?: number | null;
  };
  analysis: PhotoComparisonAnalysis;
};

const formatDateLabel = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString();
};

const imageFrameSx = {
  width: '100%',
  maxWidth: 220,
  aspectRatio: '1 / 1',
  borderRadius: 2,
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'rgba(255,255,255,0.12)',
  bgcolor: 'grey.900',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
} as const;

const CheckInPhotosDialog = ({
  open,
  onClose,
  checkIn
}: CheckInPhotosDialogProps) => {
  const starterPhotoSet = useAppSelector((s) => s.photos.starterPhotoSet);
  const [compareMode, setCompareMode] = useState(false);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<PhotoComparisonResponse | null>(null);

  const progressPhotos = useMemo(
    () => checkIn?.photos?.photos ?? [],
    [checkIn?.photos?.photos]
  );

  const starterPhotos = useMemo(
    () => starterPhotoSet?.photos ?? [],
    [starterPhotoSet?.photos]
  );

  const hasStarterPhotos = starterPhotos.length > 0;
  const hasProgressPhotos = progressPhotos.length > 0;

  const starterFrontPhoto = useMemo(
    () => starterPhotos.find((photo) => photo.position === 'front') ?? null,
    [starterPhotos]
  );

  const progressFrontPhoto = useMemo(
    () => progressPhotos.find((photo) => photo.position === 'front') ?? null,
    [progressPhotos]
  );

  const canAnalyzeVisibleProgress = Boolean(
    checkIn?._id && starterFrontPhoto?.viewUrl && progressFrontPhoto?.viewUrl
  );

  const comparisonRows = useMemo(() => {
    const positions: Array<'front' | 'side' | 'back'> = [
      'front',
      'side',
      'back'
    ];

    return positions.map((position) => ({
      position,
      starter:
        starterPhotos.find((photo) => photo.position === position) ?? null,
      progress:
        progressPhotos.find((photo) => photo.position === position) ?? null
    }));
  }, [progressPhotos, starterPhotos]);

  const comparisonPairs = useMemo(() => {
    if (analysisResult?.comparison?.pairs?.length) {
      return analysisResult.comparison.pairs;
    }

    return comparisonRows
      .filter((row) => row.starter?.viewUrl && row.progress?.viewUrl)
      .map((row) => ({
        position: row.position,
        starter: {
          position: row.starter!.position,
          storageKey: row.starter!.storageKey,
          mimeType: row.starter!.mimeType,
          viewUrl: row.starter!.viewUrl!,
          takenAt: row.starter!.takenAt ?? null
        },
        progress: {
          position: row.progress!.position,
          storageKey: row.progress!.storageKey,
          mimeType: row.progress!.mimeType,
          viewUrl: row.progress!.viewUrl!
        }
      }));
  }, [analysisResult?.comparison?.pairs, comparisonRows]);

  useEffect(() => {
    setCompareMode(false);
    setAnalysisLoading(false);
    setAnalysisError(null);
    setAnalysisResult(null);
  }, [checkIn?._id, open]);

  const handleClose = () => {
    setCompareMode(false);
    setAnalysisLoading(false);
    setAnalysisError(null);
    setAnalysisResult(null);
    onClose();
  };

  const handleAnalyzeVisibleProgress = async () => {
    if (!checkIn?._id) return;

    try {
      setAnalysisLoading(true);
      setAnalysisError(null);

      const token = await getAccessToken();
      if (!token) {
        throw new Error('You must be signed in to analyze progress photos.');
      }

      const apiUrl = import.meta.env.VITE_API_URL;

      const res = await fetch(`${apiUrl}/api/photo-comparison/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          checkInId: checkIn._id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.message || 'Failed to analyze visible progress photos'
        );
      }

      setAnalysisResult(data as PhotoComparisonResponse);
    } catch (err) {
      setAnalysisError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze visible progress photos'
      );
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
      <DialogTitle>
        {compareMode
          ? 'Compare Progress With Starter Photos'
          : 'Progress Photos'}
      </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '78vh' }}>
        {!hasProgressPhotos ? (
          <Typography variant='body2' color='text.secondary'>
            No photos available for this check-in.
          </Typography>
        ) : compareMode ? (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Box>
              <Typography variant='body2' color='text.secondary'>
                Compare this check-in against your original starter photos.
                Visible progress feedback uses all available matching angles.
              </Typography>

              {analysisResult?.comparison?.daysBetween != null ? (
                <Typography variant='caption' color='text.secondary'>
                  About {analysisResult.comparison.daysBetween} days between
                  starter and this check-in
                </Typography>
              ) : starterFrontPhoto?.takenAt ? (
                <Typography variant='caption' color='text.secondary'>
                  Starter photo taken on{' '}
                  {formatDateLabel(starterFrontPhoto.takenAt)}
                </Typography>
              ) : null}
            </Box>

            {canAnalyzeVisibleProgress ? (
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'rgba(255,255,255,0.12)',
                  bgcolor: 'rgba(255,255,255,0.03)'
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent='space-between'
                  >
                    <Box>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                        Visible Progress Analysis
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Compare matched angles and generate supportive feedback.
                      </Typography>
                    </Box>

                    <Box>
                      <Button
                        variant='contained'
                        onClick={handleAnalyzeVisibleProgress}
                        disabled={analysisLoading}
                      >
                        {analysisLoading
                          ? 'Analyzing...'
                          : analysisResult
                          ? 'Refresh Analysis'
                          : 'Analyze Visible Progress'}
                      </Button>
                    </Box>
                  </Stack>

                  {analysisLoading ? (
                    <Typography variant='body2' color='text.secondary'>
                      This can take a little bit. We’re reviewing all available
                      starter and progress angles to generate thoughtful
                      feedback.
                    </Typography>
                  ) : null}

                  {analysisError ? (
                    <Typography variant='body2' color='error'>
                      {analysisError}
                    </Typography>
                  ) : null}
                </Stack>
              </Paper>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Visible progress analysis is available when both starter and
                progress front photos exist.
              </Typography>
            )}

            {analysisResult?.analysis ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'rgba(255,255,255,0.12)',
                  bgcolor: 'rgba(255,255,255,0.03)'
                }}
              >
                <Stack spacing={1.75}>
                  <Box>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      justifyContent='space-between'
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      sx={{ mb: 0.75 }}
                    >
                      <Typography variant='h6'>
                        Visible Progress Feedback
                      </Typography>

                      {analysisResult.cached ? (
                        <Typography variant='caption' color='text.secondary'>
                          Saved analysis
                        </Typography>
                      ) : null}
                    </Stack>

                    <Typography variant='body2' color='text.secondary'>
                      {analysisResult.analysis.summary}
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems='stretch'
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ mb: 1 }}>
                        Notable Progress
                      </Typography>
                      <Stack spacing={0.75}>
                        {analysisResult.analysis.notableProgress.map((item) => (
                          <Typography key={item} variant='body2'>
                            • {item}
                          </Typography>
                        ))}
                      </Stack>
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ mb: 1 }}>
                        What This May Suggest
                      </Typography>
                      <Stack spacing={0.75}>
                        {analysisResult.analysis.likelySignals.map((item) => (
                          <Typography key={item} variant='body2'>
                            • {item}
                          </Typography>
                        ))}
                      </Stack>
                    </Paper>
                  </Stack>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'rgba(255,255,255,0.08)',
                      bgcolor: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                      Next Focus Areas
                    </Typography>
                    <Stack spacing={0.75}>
                      {analysisResult.analysis.nextFocusAreas.map((item) => (
                        <Typography key={item} variant='body2'>
                          • {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>

                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems='stretch'
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ mb: 0.75 }}>
                        Encouragement
                      </Typography>
                      <Typography variant='body2'>
                        {analysisResult.analysis.encouragement}
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ mb: 0.75 }}>
                        Confidence Note
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {analysisResult.analysis.confidenceNote}
                      </Typography>
                    </Paper>
                  </Stack>
                </Stack>
              </Paper>
            ) : null}

            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.12)',
                bgcolor: 'rgba(255,255,255,0.02)'
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  Photo Comparison
                </Typography>

                {comparisonPairs.map((pair) => (
                  <Box key={pair.position}>
                    <Stack spacing={0.75}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ textTransform: 'capitalize', fontWeight: 700 }}
                      >
                        {pair.position}
                      </Typography>

                      <Stack
                        direction='row'
                        spacing={1.5}
                        useFlexGap
                        flexWrap='wrap'
                        alignItems='flex-start'
                      >
                        <Box sx={{ width: { xs: '100%', sm: 220 } }}>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            Starter
                          </Typography>

                          <Box sx={imageFrameSx}>
                            <Box
                              component='img'
                              src={pair.starter.viewUrl}
                              alt={`${pair.position} starter`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ width: { xs: '100%', sm: 220 } }}>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            Progress
                          </Typography>

                          <Box sx={imageFrameSx}>
                            <Box
                              component='img'
                              src={pair.progress.viewUrl}
                              alt={`${pair.position} progress`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                          </Box>
                        </Box>
                      </Stack>
                    </Stack>

                    {pair.position !==
                    comparisonPairs[comparisonPairs.length - 1]?.position ? (
                      <Divider sx={{ mt: 1.5 }} />
                    ) : null}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction='row' spacing={2} flexWrap='wrap'>
              {progressPhotos.map((photo) => (
                <Box
                  key={photo.position}
                  sx={{
                    width: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Box
                    sx={{
                      width: 180,
                      height: 180,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'rgba(255,255,255,0.12)',
                      bgcolor: 'grey.900'
                    }}
                  >
                    {photo.viewUrl ? (
                      <Box
                        component='img'
                        src={photo.viewUrl}
                        alt={`${photo.position} progress`}
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
                          color='text.secondary'
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

            {hasStarterPhotos ? (
              <Box>
                <Button variant='outlined' onClick={() => setCompareMode(true)}>
                  Compare With Starter Photos
                </Button>
              </Box>
            ) : null}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        {compareMode ? (
          <Button onClick={() => setCompareMode(false)}>
            Back to Progress Photos
          </Button>
        ) : null}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckInPhotosDialog;
