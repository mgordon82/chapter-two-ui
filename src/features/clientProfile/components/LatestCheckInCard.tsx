import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import type { LatestCheckIn } from '../types';

type LatestCheckInCardProps = {
  latestCheckIn: LatestCheckIn | null;
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

const MetricItem: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <Stack spacing={0.4} sx={{ minWidth: 0 }}>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value ?? '—'}</Typography>
  </Stack>
);

const LatestCheckInCard: React.FC<LatestCheckInCardProps> = ({
  latestCheckIn
}) => {
  if (!latestCheckIn) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant='h6' fontWeight={700}>
            Latest Check-In
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            No check-in data yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

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
            <TrendingUpOutlinedIcon fontSize='small' />
          </Box>
          <Typography variant='h6' fontWeight={700}>
            Latest Check-In
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent='space-between'
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem
              label='Date'
              value={formatDate(latestCheckIn.recordedAt)}
            />

            <MetricItem
              label='Weight'
              value={latestCheckIn.weightDisplay || '—'}
            />

            <MetricItem
              label='Water'
              value={
                latestCheckIn.waterMl != null
                  ? `${latestCheckIn.waterMl} mL`
                  : '—'
              }
            />

            <MetricItem
              label='Energy'
              value={
                latestCheckIn.energy != null
                  ? `${latestCheckIn.energy}/10`
                  : '—'
              }
            />

            <MetricItem
              label='Sleep'
              value={
                latestCheckIn.sleepHours != null
                  ? `${latestCheckIn.sleepHours} hrs`
                  : '—'
              }
            />
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent='space-between'
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem
              label='Body Fat'
              value={
                latestCheckIn.bodyFatPercent != null
                  ? `${latestCheckIn.bodyFatPercent}%`
                  : '—'
              }
            />

            <MetricItem
              label='Steps'
              value={
                latestCheckIn.steps != null
                  ? latestCheckIn.steps.toLocaleString()
                  : '—'
              }
            />

            <MetricItem
              label='Workouts'
              value={
                latestCheckIn.workoutCount != null
                  ? latestCheckIn.workoutCount
                  : '—'
              }
            />

            <MetricItem
              label='On Track'
              value={
                latestCheckIn.onTrackLevel != null
                  ? `${latestCheckIn.onTrackLevel}/10`
                  : '—'
              }
            />

            <MetricItem
              label='Photos'
              value={latestCheckIn.hasPhotos ? 'Attached' : 'None'}
            />
          </Stack>
          <Divider />

          <Stack spacing={0.6}>
            <Typography sx={labelSx}>Check-In Notes</Typography>
            <Typography variant='body2' color='text.secondary' lineHeight={1.7}>
              {latestCheckIn.notes?.trim() || 'No check-in notes yet.'}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LatestCheckInCard;
