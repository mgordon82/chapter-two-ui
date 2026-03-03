import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  CircularProgress,
  Divider
} from '@mui/material';

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlagIcon from '@mui/icons-material/Flag';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { kgToLbs } from '../../../utils/conversions/weight';
import CheckInsPanel from '../../../features/checkIns';
import StatCard from '../../../components/sections/statCard';
import { trendAnalyzeRequested } from '../../../features/trend/redux/trendSlice';

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

const clamp = (lines: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden'
});

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const trend = useAppSelector((s) => s.trend);

  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [showFullQuickRead, setShowFullQuickRead] = useState(false);
  const [showFullRationale, setShowFullRationale] = useState(false);

  const profileData = useAppSelector(
    (state) => state.nutritionCalculator?.loadedProfile?.profile ?? null
  );

  const checkIns = useAppSelector((state) => state.checkIns.items);

  const unitPref = profileData?.preferences?.weightUnitPref ?? 'kg';

  const toDisplayWeight = (kg: number): number =>
    unitPref === 'lbs' ? kgToLbs(kg) : kg;

  const displayUnitLabel = unitPref === 'lbs' ? 'lb' : 'kg';

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

  const trendDeltaKg = trend.data?.metrics.avgChangePerWeekKg ?? null;
  const trendDelta =
    trendDeltaKg == null ? null : toDisplayWeight(trendDeltaKg);

  const headlineTone =
    trendDelta == null ? 'neutral' : trendDelta <= 0 ? 'down' : 'up';

  const confidenceLabel =
    trend.data?.confidence === 'high'
      ? 'High confidence'
      : trend.data?.confidence === 'medium'
      ? 'Medium confidence'
      : 'Low confidence';

  const minWeeklyN =
    trend.data?.windows?.last7?.n != null &&
    trend.data?.windows?.prev7?.n != null
      ? Math.min(trend.data.windows.last7.n, trend.data.windows.prev7.n)
      : null;

  const confidenceLine =
    minWeeklyN != null
      ? `${confidenceLabel} • ${minWeeklyN} weigh-ins/week (last 2 weeks)`
      : confidenceLabel;

  const lowConfidenceHint =
    trend.data?.confidence === 'low'
      ? 'Tip: aim for 4–7 weigh-ins/week for a clearer trend.'
      : null;

  const ANALYZE_RANGE = '3M' as const;

  const openAnalyzePanel = () => {
    setShowAnalyze(true);
    setShowTrendDetails(false);
    setShowFullQuickRead(false);
    setShowFullRationale(false);

    if (!trend.data && trend.status !== 'loading') {
      dispatch(trendAnalyzeRequested({ range: ANALYZE_RANGE }));
    }
  };

  const closeAnalyzePanel = () => {
    setShowAnalyze(false);
  };

  const rerunAnalysis = () => {
    setShowTrendDetails(false);
    dispatch(trendAnalyzeRequested({ range: ANALYZE_RANGE, force: true }));
  };

  const cachedAtLabel = trend.cachedAt
    ? `Cached: ${new Date(trend.cachedAt).toLocaleString()}`
    : null;

  const firstRec = trend.data?.ai?.recommended?.[0] ?? null;

  const quickReadText = trend.data?.ai?.quickRead ?? '';
  const rationaleText = firstRec?.rationale ?? '';

  const showQuickReadToggle = quickReadText.length > 140;
  const showRationaleToggle = rationaleText.length > 200;

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
                      Analyze your recent check-ins and get next-step
                      recommendations.
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant={showAnalyze ? 'outlined' : 'contained'}
                  onClick={() => {
                    if (showAnalyze) closeAnalyzePanel();
                    else openAnalyzePanel();
                  }}
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
                <Box sx={{ mt: 1.5 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent='space-between'
                    sx={{ mb: 1 }}
                  >
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={rerunAnalysis}
                        disabled={trend.status === 'loading'}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 999,
                          px: 1.25,
                          py: 0.25
                        }}
                      >
                        {trend.data ? 'Re-run analysis' : 'Run analysis'}
                      </Button>

                      {trend.data ? (
                        <Typography variant='caption' color='text.secondary'>
                          Cached until you re-run.
                        </Typography>
                      ) : null}
                    </Stack>

                    {cachedAtLabel ? (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ textAlign: { xs: 'left', sm: 'right' } }}
                      >
                        {cachedAtLabel}
                      </Typography>
                    ) : null}
                  </Stack>

                  {trend.status === 'loading' ? (
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <CircularProgress size={18} />
                      <Typography variant='body2' color='text.secondary'>
                        Analyzing trend…
                      </Typography>
                    </Stack>
                  ) : trend.status === 'failed' ? (
                    <Typography variant='body2' color='error'>
                      {trend.error ?? 'Failed to analyze trend.'}
                    </Typography>
                  ) : trend.data ? (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent='space-between'
                      >
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: 2,
                              display: 'grid',
                              placeItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: 'rgba(255,255,255,0.08)'
                            }}
                          >
                            <AutoAwesomeIcon fontSize='small' />
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant='subtitle2'
                              sx={{ fontWeight: 800 }}
                            >
                              Quick read
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {trend.data.ai?.context ??
                                'Based on your recent check-ins'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Box
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 999,
                            fontSize: 12,
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            color: 'text.secondary'
                          }}
                          title={confidenceLine}
                        >
                          {confidenceLine}
                        </Box>
                      </Stack>

                      <Box sx={{ mt: 1.25 }}>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 900,
                            lineHeight: 1.15,
                            color:
                              headlineTone === 'down'
                                ? 'success.light'
                                : headlineTone === 'up'
                                ? 'warning.light'
                                : 'text.primary',
                            textShadow:
                              headlineTone === 'down'
                                ? '0 0 12px rgba(46,125,50,0.35)'
                                : headlineTone === 'up'
                                ? '0 0 12px rgba(245,124,0,0.35)'
                                : 'none',
                            ...(showFullQuickRead ? {} : clamp(3))
                          }}
                        >
                          {quickReadText ||
                            (trendDelta == null
                              ? 'Not enough data yet'
                              : trendDelta <= 0
                              ? `Momentum is trending downward at ~${Math.abs(
                                  trendDelta
                                ).toFixed(1)} ${displayUnitLabel}/week`
                              : `Momentum is trending upward at ~${Math.abs(
                                  trendDelta
                                ).toFixed(1)} ${displayUnitLabel}/week`)}
                        </Typography>

                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            mt: 0.5,
                            ...(showFullQuickRead ? {} : clamp(2))
                          }}
                        >
                          {trend.data.status === 'insufficient_data'
                            ? 'Log a few more weigh-ins this week to sharpen the signal and unlock stronger recommendations.'
                            : 'Small week-to-week swings are normal — we’re looking for consistent direction over 10–14 days.'}
                        </Typography>

                        {lowConfidenceHint ? (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{
                              mt: 0.5,
                              ...(showFullQuickRead ? {} : clamp(2))
                            }}
                          >
                            {lowConfidenceHint}
                          </Typography>
                        ) : null}

                        {showQuickReadToggle ? (
                          <Button
                            size='small'
                            onClick={() => setShowFullQuickRead((v) => !v)}
                            sx={{
                              mt: 0.75,
                              textTransform: 'none',
                              borderRadius: 999,
                              px: 1.25,
                              py: 0.25
                            }}
                          >
                            {showFullQuickRead ? 'Show less' : 'Read more'}
                          </Button>
                        ) : null}
                      </Box>

                      {(firstRec || trend.data.options?.length) && (
                        <Box sx={{ mt: 1.25 }}>
                          <Divider sx={{ mb: 1.25, opacity: 0.5 }} />

                          {firstRec ? (
                            <Stack spacing={1}>
                              <Box
                                sx={{
                                  p: 1.25,
                                  borderRadius: 2,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  backgroundColor: 'rgba(255,255,255,0.04)'
                                }}
                              >
                                <Typography
                                  variant='overline'
                                  color='text.secondary'
                                  sx={{ letterSpacing: 0.8 }}
                                >
                                  Next step
                                </Typography>
                                <Typography
                                  variant='body1'
                                  sx={{ fontWeight: 800, lineHeight: 1.25 }}
                                >
                                  {firstRec.title}
                                </Typography>
                                {firstRec.summary ? (
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    sx={{ mt: 0.25, ...clamp(3) }}
                                  >
                                    {firstRec.summary}
                                  </Typography>
                                ) : null}
                              </Box>

                              {firstRec.rationale ? (
                                <Box
                                  sx={{
                                    p: 1.25,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'rgba(255,255,255,0.03)'
                                  }}
                                >
                                  <Stack
                                    direction='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                    spacing={1}
                                  >
                                    <Typography
                                      variant='overline'
                                      color='text.secondary'
                                      sx={{ letterSpacing: 0.8 }}
                                    >
                                      Why
                                    </Typography>

                                    {showRationaleToggle ? (
                                      <Button
                                        size='small'
                                        onClick={() =>
                                          setShowFullRationale((v) => !v)
                                        }
                                        sx={{
                                          textTransform: 'none',
                                          borderRadius: 999,
                                          px: 1.0,
                                          py: 0.0,
                                          minWidth: 'auto'
                                        }}
                                      >
                                        {showFullRationale
                                          ? 'Show less'
                                          : 'Read more'}
                                      </Button>
                                    ) : null}
                                  </Stack>

                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                    sx={{
                                      mt: 0.25,
                                      lineHeight: 1.5,
                                      ...(showFullRationale ? {} : clamp(4))
                                    }}
                                  >
                                    {rationaleText}
                                  </Typography>
                                </Box>
                              ) : null}
                            </Stack>
                          ) : (
                            <Box
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: 'rgba(255,255,255,0.04)'
                              }}
                            >
                              <Typography
                                variant='overline'
                                color='text.secondary'
                                sx={{ letterSpacing: 0.8 }}
                              >
                                Next step
                              </Typography>
                              <Typography
                                variant='body2'
                                sx={{ fontWeight: 700 }}
                              >
                                {trend.data.options[0].title}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ mt: 0.25 }}
                              >
                                {trend.data.options[0].summary}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      <Box sx={{ mt: 1.25 }}>
                        <Button
                          size='small'
                          onClick={() => setShowTrendDetails((v) => !v)}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 999,
                            px: 1.25,
                            py: 0.25
                          }}
                        >
                          {showTrendDetails ? 'Hide details' : 'Details'}
                        </Button>

                        <Collapse
                          in={showTrendDetails}
                          timeout={150}
                          unmountOnExit
                        >
                          <Stack spacing={0.5} sx={{ mt: 1 }}>
                            <Typography variant='body2' color='text.secondary'>
                              Avg(last 7d):{' '}
                              {trend.data.metrics.avgLast7dKg == null
                                ? '—'
                                : `${toDisplayWeight(
                                    trend.data.metrics.avgLast7dKg
                                  ).toFixed(1)} ${displayUnitLabel}`}
                            </Typography>

                            <Typography variant='body2' color='text.secondary'>
                              Avg(prev 7d):{' '}
                              {trend.data.metrics.avgPrev7dKg == null
                                ? '—'
                                : `${toDisplayWeight(
                                    trend.data.metrics.avgPrev7dKg
                                  ).toFixed(1)} ${displayUnitLabel}`}
                            </Typography>

                            <Typography variant='body2' color='text.secondary'>
                              Change/week:{' '}
                              {trend.data.metrics.avgChangePerWeekKg == null
                                ? '—'
                                : `${toDisplayWeight(
                                    trend.data.metrics.avgChangePerWeekKg
                                  ).toFixed(2)} ${displayUnitLabel}/wk`}
                              {trend.data.metrics.avgChangePerWeekPct != null
                                ? ` (${trend.data.metrics.avgChangePerWeekPct.toFixed(
                                    2
                                  )}%)`
                                : ''}
                            </Typography>

                            {trend.data.ai?.disclaimer ? (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {trend.data.ai.disclaimer}
                              </Typography>
                            ) : null}
                          </Stack>
                        </Collapse>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      Click “Run analysis” to run analysis.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Stack>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems='stretch'
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 1, display: 'flex' }}>
            <StatCard
              title='Current Weight'
              value={`${currentWeight} ${displayUnitLabel}`}
              helper={`Last check-in: ${lastCheckInLabel}`}
              icon={<TrendingDownIcon fontSize='small' />}
              tone='primary'
            />
          </Box>

          <Box sx={{ flex: 1, display: 'flex' }}>
            <StatCard
              title='Goal Weight'
              value={hasGoal ? `${goalWeight} ${displayUnitLabel}` : '—'}
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
                serverAvgChange == null
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
