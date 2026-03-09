import { useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography
} from '@mui/material';

import { useAppSelector } from '../../../app/hooks';
import type { CheckIn } from '../redux/checkInsSlice';

type CheckInPhotosDialogProps = {
  open: boolean;
  onClose: () => void;
  checkIn: CheckIn | null;
};

const CheckInPhotosDialog = ({
  open,
  onClose,
  checkIn
}: CheckInPhotosDialogProps) => {
  const starterPhotoSet = useAppSelector((s) => s.photos.starterPhotoSet);
  const [compareMode, setCompareMode] = useState(false);

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

  const handleClose = () => {
    setCompareMode(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
      <DialogTitle>
        {compareMode
          ? 'Compare Progress With Starter Photos'
          : 'Progress Photos'}
      </DialogTitle>

      <DialogContent>
        {!hasProgressPhotos ? (
          <Typography variant='body2' color='text.secondary'>
            No photos available for this check-in.
          </Typography>
        ) : compareMode ? (
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Compare the selected check-in photos against the original starter
              photos.
            </Typography>

            {comparisonRows.map((row) => (
              <Stack key={row.position} spacing={1.25}>
                <Typography
                  variant='subtitle2'
                  sx={{ textTransform: 'capitalize', fontWeight: 700 }}
                >
                  {row.position}
                </Typography>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems='stretch'
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 0.75 }}
                    >
                      Starter
                    </Typography>

                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 280,
                        aspectRatio: '1 / 1',
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
                      {row.starter?.viewUrl ? (
                        <Box
                          component='img'
                          src={row.starter.viewUrl}
                          alt={`${row.position} starter`}
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
                          No starter photo
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 0.75 }}
                    >
                      Progress
                    </Typography>

                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 280,
                        aspectRatio: '1 / 1',
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
                      {row.progress?.viewUrl ? (
                        <Box
                          component='img'
                          src={row.progress.viewUrl}
                          alt={`${row.position} progress`}
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
                          No progress photo
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </Stack>
            ))}
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
