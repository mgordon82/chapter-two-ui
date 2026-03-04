import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Card, CardContent, Typography } from '@mui/material';

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlagIcon from '@mui/icons-material/Flag';
import TimelineIcon from '@mui/icons-material/Timeline';

import { useAppSelector } from '../../../app/hooks';
import { kgToLbs } from '../../../utils/conversions/weight';
import StatCard from '../../../components/sections/statCard';
import TrendAnalysisCard from '../../../features/trend';
import WeightOverTimeChartCard from '../../../components/sections/weightOverTimeCard';
import type { WeightUnitPref } from '../../../types/units';

const Dashboard = () => {
  const trend = useAppSelector((s) => s.trend);

  const profileData = useAppSelector(
    (state) => state.nutritionCalculator?.loadedProfile?.profile ?? null
  );

  const checkIns = useAppSelector((state) => state.checkIns.items);

  const pickWeightUnitPref = (value: unknown): WeightUnitPref | null => {
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;

    const prefs = obj.preferences;
    if (prefs && typeof prefs === 'object') {
      const w = (prefs as Record<string, unknown>).weightUnitPref;
      if (w === 'kg' || w === 'lbs') return w;
    }

    const direct = obj.weightUnitPref;
    if (direct === 'kg' || direct === 'lbs') return direct;

    const unitPrefs = obj.unitPrefs;
    if (unitPrefs && typeof unitPrefs === 'object') {
      const w2 = (unitPrefs as Record<string, unknown>).weightUnitPref;
      if (w2 === 'kg' || w2 === 'lbs') return w2;
    }

    return null;
  };

  const authCurrentUser = useAppSelector((s) => s.auth.currentUser as unknown);
  const authWeightUnitPref = pickWeightUnitPref(authCurrentUser);

  const unitPrefRaw =
    authWeightUnitPref ?? profileData?.preferences?.weightUnitPref ?? null;
  const unitReady = unitPrefRaw === 'kg' || unitPrefRaw === 'lbs';

  const unitPref = unitReady ? unitPrefRaw : 'kg';
  const displayUnitLabel = unitPref === 'lbs' ? 'lb' : 'kg';

  const toDisplayWeight = (kg: number): number =>
    unitPref === 'lbs' ? kgToLbs(kg) : kg;

  const nonDeleted = useMemo(
    () =>
      checkIns.filter(
        (c) => !c.isDeleted && typeof c.metrics?.weightKg === 'number'
      ),
    [checkIns]
  );

  const sorted = useMemo(() => {
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

  const serverAvgChangeKg = trend.data?.metrics.avgChangePerWeekKg ?? null;
  const serverAvgChange =
    serverAvgChangeKg == null ? null : toDisplayWeight(serverAvgChangeKg);

  const serverConfidence = trend.data?.confidence ?? 'low';
  const last7n = trend.data?.windows?.last7?.n ?? 0;
  const prev7n = trend.data?.windows?.prev7?.n ?? 0;

  const avgTone =
    serverAvgChange == null ||
    serverConfidence === 'low' ||
    trend.data?.status === 'insufficient_data'
      ? 'warn'
      : serverAvgChange <= 0
      ? 'good'
      : 'bad';

  const avgChip =
    serverConfidence === 'high'
      ? 'High confidence'
      : serverConfidence === 'medium'
      ? 'Med confidence'
      : 'Low confidence';

  const avgHelper = !trend.data
    ? 'Run “Analyze trend” to calculate'
    : trend.data.status === 'insufficient_data'
    ? `Need check-ins in both weeks • ${last7n} vs ${prev7n}`
    : `Avg(last 7d) − Avg(prev 7d) • ${last7n} vs ${prev7n} check-ins`;

  const startWeightKg =
    sorted.length > 0
      ? sorted[0].metrics.weightKg
      : profileWeightKg ?? currentWeightKg;

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
        <TrendAnalysisCard
          trend={trend}
          displayUnitLabel={displayUnitLabel}
          unitPref={unitPref}
        />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems='stretch'
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 1, display: 'flex' }}>
            <StatCard
              title='Current Weight'
              value={unitReady ? `${currentWeight} ${displayUnitLabel}` : '—'}
              helper={`Last check-in: ${lastCheckInLabel}`}
              icon={<TrendingDownIcon fontSize='small' />}
              tone='primary'
            />
          </Box>

          <Box sx={{ flex: 1, display: 'flex' }}>
            <StatCard
              title='Goal Weight'
              value={
                hasGoal && unitReady ? `${goalWeight} ${displayUnitLabel}` : '—'
              }
              helper={
                <>
                  {hasGoal ? 'Goal set in ' : 'Set a goal weight in '}
                  <Typography
                    component={RouterLink}
                    to='/app/nutrition-profile'
                    sx={{
                      display: 'inline',
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    profile
                  </Typography>
                </>
              }
              icon={<FlagIcon fontSize='small' />}
              tone='goal'
            />
          </Box>

          <Box sx={{ flex: 1, display: 'flex' }}>
            <StatCard
              title='Avg Change / Week'
              value={
                !unitReady || serverAvgChange == null
                  ? '—'
                  : `${serverAvgChange > 0 ? '+' : ''}${serverAvgChange.toFixed(
                      1
                    )} ${displayUnitLabel}/week`
              }
              helper={avgHelper}
              chipLabel={avgChip}
              icon={<TimelineIcon fontSize='small' />}
              tone={avgTone}
            />
          </Box>
        </Stack>

        <WeightOverTimeChartCard />

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

                {/* Progress Bar */}
                {(() => {
                  const clampedPct = Math.max(0, Math.min(100, progressPct));
                  const thumbPct = Math.max(2, Math.min(98, clampedPct));

                  return (
                    <Box
                      sx={{
                        mt: 1.0,
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover [data-pctp], &:focus-within [data-pctp]': {
                          opacity: 1,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {/* Floating % pill (NOT inside the overflow-hidden track) */}
                      <Box
                        data-pctp
                        sx={{
                          position: 'absolute',
                          top: -26,
                          left: `calc(${thumbPct}% - 18px)`,
                          transition:
                            'left 650ms ease, opacity 180ms ease, transform 180ms ease',
                          opacity: 0,
                          transform: 'translateY(0px)',
                          zIndex: 2,
                          pointerEvents: 'none'
                        }}
                      >
                        <Box
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 800,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(8px)',
                            color: 'common.white',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {clampedPct.toFixed(0)}%
                        </Box>
                      </Box>

                      {/* Track (overflow hidden stays here) */}
                      <Box
                        role='progressbar'
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={clampedPct}
                        tabIndex={0}
                        sx={{
                          height: 12,
                          borderRadius: 999,
                          backgroundColor: 'rgba(255,255,255,0.16)',
                          border: '1px solid',
                          borderColor: 'divider',
                          position: 'relative',
                          overflow: 'hidden',
                          outline: 'none',
                          '&:focus-visible': {
                            boxShadow: '0 0 0 3px rgba(2,136,209,0.25)'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${clampedPct}%`,
                            borderRadius: 999,
                            background:
                              'linear-gradient(90deg, rgba(46,125,50,0.75), rgba(2,136,209,0.55))',
                            transition: 'width 650ms ease'
                          }}
                        />

                        {/* Thumb */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: `calc(${thumbPct}% - 8px)`,
                            transform: 'translateY(-50%)',
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow:
                              '0 4px 12px rgba(0,0,0,0.25), 0 0 10px rgba(2,136,209,0.25)',
                            transition: 'left 650ms ease'
                          }}
                        />
                      </Box>

                      {/* Labels (keep only ONE set — you currently have two) */}
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        sx={{ mt: 0.5 }}
                      >
                        <Typography variant='caption' color='text.secondary'>
                          Start
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Goal
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })()}
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
                  serverAvgChange != null && serverAvgChange !== 0 ? (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 0.5 }}
                    >
                      At {Math.abs(serverAvgChange).toFixed(1)}{' '}
                      {displayUnitLabel}/week, estimate ~
                      {Math.ceil(
                        (currentWeight - goalWeight) /
                          Math.max(0.1, Math.abs(serverAvgChange))
                      )}{' '}
                      weeks
                    </Typography>
                  ) : (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 0.5 }}
                    >
                      Run trend analysis to estimate time to goal.
                    </Typography>
                  )
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
