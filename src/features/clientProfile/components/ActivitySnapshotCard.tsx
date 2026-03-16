import React from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
import type { ActivitySnapshot } from '../types';

type ActivitySnapshotCardProps = {
  activity: ActivitySnapshot;
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

const ActivitySnapshotCard: React.FC<ActivitySnapshotCardProps> = ({
  activity
}) => {
  const avgSteps = activity.averageSteps ?? null;
  const avgSleepHours = activity.averageSleepHours ?? null;
  const workoutsCompleted = activity.workoutsCompleted ?? null;
  const workoutsScheduled = activity.workoutsScheduled ?? null;
  const cardioMinutes = activity.cardioMinutes ?? null;
  const strengthSessions = activity.strengthSessions ?? null;
  const adherence = activity.adherenceScore ?? null;
  const checkInStreakDays = activity.streaks?.checkInStreakDays ?? null;
  const workoutStreakDays = activity.streaks?.workoutStreakDays ?? null;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 2 }}>
          <DirectionsWalkOutlinedIcon fontSize='small' />
          <Typography variant='h6' fontWeight={700}>
            Activity Snapshot
          </Typography>
        </Stack>

        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem
              label='Period'
              value={activity.period ? activity.period.toUpperCase() : '—'}
            />
            <MetricItem
              label='Avg Steps'
              value={avgSteps != null ? avgSteps.toLocaleString() : '—'}
            />
            <MetricItem
              label='Avg Sleep'
              value={
                avgSleepHours != null ? `${avgSleepHours.toFixed(1)} hrs` : '—'
              }
            />
            <MetricItem
              label='Adherence'
              value={adherence != null ? `${adherence}%` : '—'}
            />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem
              label='Workouts Completed'
              value={workoutsCompleted ?? '—'}
            />
            <MetricItem
              label='Workouts Scheduled'
              value={workoutsScheduled ?? '—'}
            />
            <MetricItem
              label='Strength Sessions'
              value={strengthSessions ?? '—'}
            />
            <MetricItem label='Cardio Minutes' value={cardioMinutes ?? '—'} />
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem
              label='Check-In Streak'
              value={
                checkInStreakDays != null ? `${checkInStreakDays} days` : '—'
              }
            />
            <MetricItem
              label='Workout Streak'
              value={
                workoutStreakDays != null ? `${workoutStreakDays} days` : '—'
              }
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActivitySnapshotCard;
