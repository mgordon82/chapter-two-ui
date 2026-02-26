import React from 'react';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  Divider
} from '@mui/material';

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlagIcon from '@mui/icons-material/Flag';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsightsIcon from '@mui/icons-material/Insights';
import { useAppSelector } from '../../../app/hooks';
import { kgToLbs } from '../../../utils/conversions/weight';
import CheckInsPanel from '../../../features/checkIns/components/CheckInsPanel';

const StatCard = ({
  title,
  value,
  helper,
  icon,
  tone = 'neutral'
}: {
  title: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
  tone?: 'good' | 'bad' | 'neutral' | 'goal';
}) => {
  const toneStyles =
    tone === 'good'
      ? {
          border: '1px solid',
          borderColor: 'success.light',
          background:
            'linear-gradient(135deg, rgba(46,125,50,0.12), rgba(46,125,50,0.02))'
        }
      : tone === 'bad'
      ? {
          border: '1px solid',
          borderColor: 'error.light',
          background:
            'linear-gradient(135deg, rgba(211,47,47,0.12), rgba(211,47,47,0.02))'
        }
      : tone === 'goal'
      ? {
          border: '1px solid',
          borderColor: 'info.light',
          background:
            'linear-gradient(135deg, rgba(2,136,209,0.12), rgba(2,136,209,0.02))'
        }
      : {
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(99,102,241,0.02))'
        };

  return (
    <Card
      elevation={0}
      sx={{
        ...toneStyles,
        borderRadius: 3
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction='row' spacing={1.5} alignItems='flex-start'>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.6)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            {icon}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant='overline' sx={{ letterSpacing: 0.8 }}>
              {title}
            </Typography>

            <Typography variant='h4' sx={{ mt: 0.25, fontWeight: 700 }}>
              {value}
            </Typography>

            {helper ? (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 0.5 }}
              >
                {helper}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const PlaceholderChart = () => {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        background:
          'linear-gradient(135deg, rgba(2,136,209,0.08), rgba(2,136,209,0.01))'
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.6)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <TimelineIcon fontSize='small' />
            </Box>
            <Box>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, lineHeight: 1.1 }}
              >
                Weight Over Time
              </Typography>
            </Box>
          </Stack>

          <CheckInsPanel />
        </Stack>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [showAnalyze, setShowAnalyze] = React.useState(false);

  const profileData = useAppSelector(
    (state) => state.nutritionCalculator?.loadedProfile?.profile ?? null
  );

  const checkIns = useAppSelector((state) => state.checkIns.items);

  const unitPref = profileData?.preferences?.weightUnitPref ?? 'kg';

  const toDisplayWeight = (kg: number): number =>
    unitPref === 'lbs' ? kgToLbs(kg) : kg;

  const displayUnitLabel = unitPref === 'lbs' ? 'lb' : 'kg';

  const nonDeleted = React.useMemo(
    () =>
      checkIns.filter(
        (c) => !c.isDeleted && typeof c.metrics?.weightKg === 'number'
      ),
    [checkIns]
  );

  const sorted = React.useMemo(() => {
    return [...nonDeleted].sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
  }, [nonDeleted]);

  const latest = sorted.length ? sorted[sorted.length - 1] : null;

  const profileWeightKg = profileData?.weightKg ?? null;
  const goalWeightKg = profileData?.goalWeightKg ?? null;
  const hasGoal = goalWeightKg != null && goalWeightKg > 0;

  const currentWeightKg = latest?.metrics.weightKg ?? profileWeightKg ?? 0;

  const currentWeight = toDisplayWeight(currentWeightKg);
  const goalWeight = hasGoal ? toDisplayWeight(goalWeightKg) : 0;

  const lastCheckInLabel = latest
    ? new Date(latest.recordedAt).toLocaleDateString()
    : 'No check-ins yet';

  const [nowMs, setNowMs] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNowMs(Date.now());
  }, []);

  const windowDays = 28;
  const windowStartMs =
    nowMs == null ? null : nowMs - windowDays * 24 * 60 * 60 * 1000;

  const windowed = React.useMemo(() => {
    if (windowStartMs == null) return sorted;

    const within = sorted.filter(
      (c) => new Date(c.recordedAt).getTime() >= windowStartMs
    );

    return within.length >= 2 ? within : sorted;
  }, [sorted, windowStartMs]);

  const firstInWindow = windowed.length ? windowed[0] : null;
  const lastInWindow = windowed.length ? windowed[windowed.length - 1] : null;

  const avgChangePerWeekKg = React.useMemo(() => {
    if (!firstInWindow || !lastInWindow) return 0;

    const t0 = new Date(firstInWindow.recordedAt).getTime();
    const t1 = new Date(lastInWindow.recordedAt).getTime();
    const weeks = (t1 - t0) / (7 * 24 * 60 * 60 * 1000);

    if (weeks <= 0) return 0;

    const deltaKg =
      lastInWindow.metrics.weightKg - firstInWindow.metrics.weightKg;
    return deltaKg / weeks;
  }, [firstInWindow, lastInWindow]);

  const avgChangePerWeek = toDisplayWeight(avgChangePerWeekKg);

  const startWeightKg =
    firstInWindow?.metrics.weightKg ?? profileWeightKg ?? currentWeightKg;

  const progressLostKg = startWeightKg - currentWeightKg;

  const totalToLoseKg = hasGoal ? startWeightKg - goalWeightKg : 0;

  const progressLost = toDisplayWeight(progressLostKg);
  const totalToLose = toDisplayWeight(totalToLoseKg);

  const progressPct =
    hasGoal && totalToLoseKg > 0
      ? Math.min(100, Math.max(0, (progressLostKg / totalToLoseKg) * 100))
      : 0;

  const remainingToGoal = hasGoal
    ? toDisplayWeight(currentWeightKg - goalWeightKg)
    : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2.25} sx={{ width: '100%' }}>
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            background:
              'linear-gradient(135deg, rgba(255,193,7,0.10), rgba(255,193,7,0.02))'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                spacing={2}
              >
                <Stack direction='row' spacing={1.25} alignItems='center'>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.6)',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <AutoAwesomeIcon fontSize='small' />
                  </Box>

                  <Box>
                    <Typography
                      variant='subtitle1'
                      sx={{ fontWeight: 700, lineHeight: 1.1 }}
                    >
                      Trend Analysis
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      This will trigger AI later — for now it’s static.
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant={showAnalyze ? 'outlined' : 'contained'}
                  onClick={() => setShowAnalyze((v) => !v)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700
                  }}
                >
                  {showAnalyze ? 'Hide analysis' : 'Analyze trend'}
                </Button>
              </Stack>

              <Collapse in={showAnalyze} timeout={200} unmountOnExit>
                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1.25}>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <InsightsIcon fontSize='small' />
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      Quick read (static)
                    </Typography>
                  </Stack>

                  <Typography variant='body2' color='text.secondary'>
                    Your last few check-ins suggest a small downward trend. If
                    progress stalls for 10-14 days, we'll ask a few questions
                    (adherence, steps, workouts, sleep) and recommend a small
                    7-10 day experiment (macro tweak or activity bump).
                  </Typography>

                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'rgba(255,255,255,0.55)'
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      Next step (example)
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Keep protein steady. If needed, reduce carbs by
                      ~25–35g/day for 10 days OR add +2,000 steps/day average.
                    </Typography>
                  </Box>
                </Stack>
              </Collapse>
            </Stack>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 1 }}>
            <StatCard
              title='Current Weight'
              value={`${currentWeight} ${displayUnitLabel}`}
              helper={`Last check-in: ${lastCheckInLabel}`}
              icon={<TrendingDownIcon fontSize='small' />}
              tone='neutral'
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatCard
              title='Goal Weight'
              value={hasGoal ? `${goalWeight} ${displayUnitLabel}` : '—'}
              helper={
                hasGoal ? 'Goal set in profile' : 'Set a goal weight in profile'
              }
              icon={<FlagIcon fontSize='small' />}
              tone='goal'
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatCard
              title='Avg Change / Week'
              value={`${
                avgChangePerWeek > 0 ? '+' : ''
              }${avgChangePerWeek.toFixed(1)} ${displayUnitLabel}/week`}
              helper='Based on last 4 weeks'
              icon={<TimelineIcon fontSize='small' />}
              tone={avgChangePerWeek <= 0 ? 'good' : 'bad'}
            />
          </Box>
        </Stack>

        <PlaceholderChart />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems='stretch'
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                background:
                  'linear-gradient(135deg, rgba(46,125,50,0.10), rgba(46,125,50,0.02))',
                width: '100%'
              }}
            >
              <CardContent
                sx={{
                  p: 2.25,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant='overline' sx={{ letterSpacing: 0.8 }}>
                  Progress to Goal
                </Typography>
                <Typography variant='h4' sx={{ mt: 0.25, fontWeight: 700 }}>
                  {progressPct.toFixed(0)}%
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 0.5 }}
                >
                  Example: {progressLost.toFixed(1)} {displayUnitLabel} lost of{' '}
                  {totalToLose.toFixed(1)} {displayUnitLabel}
                </Typography>

                <Box sx={{ flex: 1 }} />

                <Box
                  sx={{
                    mt: 1.5,
                    height: 10,
                    borderRadius: 99,
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${progressPct}%`,
                      borderRadius: 99,
                      background:
                        'linear-gradient(90deg, rgba(46,125,50,0.75), rgba(2,136,209,0.55))'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: 1, display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                background:
                  'linear-gradient(135deg, rgba(2,136,209,0.10), rgba(2,136,209,0.02))',
                width: '100%'
              }}
            >
              <CardContent
                sx={{
                  p: 2.25,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant='overline' sx={{ letterSpacing: 0.8 }}>
                  Remaining to Goal
                </Typography>
                <Typography variant='h4' sx={{ mt: 0.25, fontWeight: 700 }}>
                  {remainingToGoal.toFixed(1)} {displayUnitLabel}
                </Typography>

                {hasGoal ? (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}
                  >
                    At {Math.abs(avgChangePerWeek).toFixed(1)}{' '}
                    {displayUnitLabel}
                    /week, estimate ~
                    {Math.ceil(
                      (currentWeight - goalWeight) /
                        Math.max(0.1, Math.abs(avgChangePerWeek))
                    )}{' '}
                    weeks
                  </Typography>
                ) : (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mt: 0.5 }}
                  >
                    Set a goal weight to estimate time to goal.
                  </Typography>
                )}

                <Box sx={{ flex: 1 }} />

                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,255,255,0.55)'
                  }}
                >
                  <Typography variant='body2' sx={{ fontWeight: 700 }}>
                    Tip (static)
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    When the scale stalls, focus on consistency for 7–10 days
                    before cutting harder.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Dashboard;
