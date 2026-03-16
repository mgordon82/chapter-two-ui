import React from 'react';
import {
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
  Box
} from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import type { ProgressPhotos } from '../types';

type ProgressPhotosCardProps = {
  photos: ProgressPhotos;
};

type PhotoItem = {
  id: string;
  label: string;
  updatedAt: string;
  url: string;
};

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const labelSx = {
  fontSize: '0.78rem',
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: 0.6
};

const valueSx = {
  fontSize: '0.98rem',
  fontWeight: 600,
  color: 'text.primary'
};

const MetricItem: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <Stack spacing={0.4} sx={{ minWidth: 0 }}>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value ?? '—'}</Typography>
  </Stack>
);

const ProgressPhotosCard: React.FC<ProgressPhotosCardProps> = ({ photos }) => {
  const latestSet = photos.latestSet;

  const items: PhotoItem[] = latestSet
    ? ([
        latestSet.photos.front?.url && {
          id: 'front',
          label: 'Front',
          updatedAt: latestSet.capturedAt,
          url: latestSet.photos.front.url
        },
        latestSet.photos.side?.url && {
          id: 'side',
          label: 'Side',
          updatedAt: latestSet.capturedAt,
          url: latestSet.photos.side.url
        },
        latestSet.photos.back?.url && {
          id: 'back',
          label: 'Back',
          updatedAt: latestSet.capturedAt,
          url: latestSet.photos.back.url
        }
      ].filter(Boolean) as PhotoItem[])
    : [];

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid'
            }}
          >
            <CameraAltOutlinedIcon fontSize='small' />
          </Box>
          <Typography variant='h6' fontWeight={700}>
            Progress Photos
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem label='Total Sets' value={photos.totalSets} />
            <MetricItem
              label='Latest Capture'
              value={latestSet ? formatDate(latestSet.capturedAt) : '—'}
            />
            <MetricItem label='Photos In Set' value={items.length} />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap='wrap'
            alignItems='stretch'
          >
            {items.length > 0 ? (
              items.map((photo) => (
                <Paper
                  key={photo.id}
                  variant='outlined'
                  sx={{
                    borderRadius: 3,
                    p: 1.25,
                    width: { xs: '100%', sm: 180 },
                    flex: '0 0 auto'
                  }}
                >
                  <Box
                    component='img'
                    src={photo.url}
                    alt={`${photo.label} progress`}
                    sx={{
                      width: '100%',
                      height: 220,
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />

                  <Typography fontWeight={600} sx={{ mt: 1.25 }}>
                    {photo.label}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Captured {formatDate(photo.updatedAt)}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No progress photos available yet.
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProgressPhotosCard;
