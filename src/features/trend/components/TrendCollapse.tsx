import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  Typography
} from '@mui/material';

import { toDisplayWeight } from '../../checkIns/helpers';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  trendInsightRequested,
  type TrendRange,
  type TrendState
} from '../redux/trendSlice';
import type { WeightUnitPref } from '../../../types/units';
import { useAppDispatch } from '../../../app/hooks';

type TrendCollapseProps = {
  trend: TrendState;
  range: TrendRange;
  displayUnitLabel: 'kg' | 'lb';
  unitPref: WeightUnitPref;
  showAnalyze: boolean;
  showTrendDetails: boolean;
  setShowTrendDetails: React.Dispatch<React.SetStateAction<boolean>>;
  showFullQuickRead: boolean;
  setShowFullQuickRead: React.Dispatch<React.SetStateAction<boolean>>;
  showFullRationale: boolean;
  setShowFullRationale: React.Dispatch<React.SetStateAction<boolean>>;
};

const TrendCollapseSection = ({
  trend,
  range,
  displayUnitLabel,
  unitPref,
  showAnalyze,
  showTrendDetails,
  setShowTrendDetails,
  showFullQuickRead,
  setShowFullQuickRead,
  showFullRationale,
  setShowFullRationale
}: TrendCollapseProps) => {
  const dispatch = useAppDispatch();

  const metricsState = trend.metrics;
  const insightState = trend.insight;

  const metricsData = metricsState.data;
  const insightData = insightState.data;

  const clamp = (lines: number) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  });

  const trendDeltaKg = metricsData?.metrics.avgChangePerWeekKg ?? null;
  const trendDelta =
    trendDeltaKg == null ? null : toDisplayWeight(trendDeltaKg, unitPref);

  const headlineTone =
    trendDelta == null ? 'neutral' : trendDelta <= 0 ? 'down' : 'up';

  const confidenceLabel =
    metricsData?.confidence === 'high'
      ? 'High confidence'
      : metricsData?.confidence === 'medium'
      ? 'Medium confidence'
      : 'Low confidence';

  const minWeeklyN =
    metricsData?.windows?.last7?.n != null &&
    metricsData?.windows?.prev7?.n != null
      ? Math.min(metricsData.windows.last7.n, metricsData.windows.prev7.n)
      : null;

  const confidenceLine =
    minWeeklyN != null
      ? `${confidenceLabel} • ${minWeeklyN} weigh-ins/week (last 2 weeks)`
      : confidenceLabel;

  const lowConfidenceHint =
    metricsData?.confidence === 'low'
      ? 'Tip: aim for 4–7 weigh-ins/week for a clearer trend.'
      : null;

  const rerunInsight = () => {
    setShowTrendDetails(false);
    dispatch(trendInsightRequested({ range, force: true }));
  };

  const cachedAtLabel = insightState.cachedAt
    ? `Cached: ${new Date(insightState.cachedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })}`
    : null;

  const firstRec = insightData?.ai?.recommended?.[0] ?? null;
  const firstOption = insightData?.options?.[0] ?? null;

  const quickReadText = insightData?.ai?.quickRead ?? '';
  const rationaleText = firstRec?.rationale ?? '';

  const showQuickReadToggle = quickReadText.length > 140;
  const showRationaleToggle = rationaleText.length > 200;

  return (
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
              onClick={rerunInsight}
              disabled={insightState.status === 'loading'}
              sx={{
                textTransform: 'none',
                borderRadius: 999,
                px: 1.25,
                py: 0.25
              }}
            >
              {insightData ? 'Re-run insight' : 'Generate insight'}
            </Button>

            {insightData ? (
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

        {insightState.status === 'loading' ? (
          <Stack direction='row' spacing={1} alignItems='center'>
            <CircularProgress size={18} />
            <Typography variant='body2' color='text.secondary'>
              Generating insight…
            </Typography>
          </Stack>
        ) : insightState.status === 'failed' ? (
          <Typography variant='body2' color='error'>
            {insightState.error ?? 'Failed to generate insight.'}
          </Typography>
        ) : insightData ? (
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
                  <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
                    Quick read
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {insightData.ai?.context ??
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
                {metricsData?.status === 'insufficient_data'
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

            {(firstRec || firstOption) && (
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
                              onClick={() => setShowFullRationale((v) => !v)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 999,
                                px: 1.0,
                                py: 0.0,
                                minWidth: 'auto'
                              }}
                            >
                              {showFullRationale ? 'Show less' : 'Read more'}
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
                ) : firstOption ? (
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
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {firstOption.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 0.25 }}
                    >
                      {firstOption.summary}
                    </Typography>
                  </Box>
                ) : null}
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

              <Collapse in={showTrendDetails} timeout={150} unmountOnExit>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Avg(last 7d):{' '}
                    {metricsData?.metrics.avgLast7dKg == null
                      ? '—'
                      : `${toDisplayWeight(
                          metricsData.metrics.avgLast7dKg,
                          unitPref
                        ).toFixed(1)} ${displayUnitLabel}`}
                  </Typography>

                  <Typography variant='body2' color='text.secondary'>
                    Avg(prev 7d):{' '}
                    {metricsData?.metrics.avgPrev7dKg == null
                      ? '—'
                      : `${toDisplayWeight(
                          metricsData.metrics.avgPrev7dKg,
                          unitPref
                        ).toFixed(1)} ${displayUnitLabel}`}
                  </Typography>

                  <Typography variant='body2' color='text.secondary'>
                    Change/week:{' '}
                    {metricsData?.metrics.avgChangePerWeekKg == null
                      ? '—'
                      : `${toDisplayWeight(
                          metricsData.metrics.avgChangePerWeekKg,
                          unitPref
                        ).toFixed(2)} ${displayUnitLabel}/wk`}
                    {metricsData?.metrics.avgChangePerWeekPct != null
                      ? ` (${metricsData.metrics.avgChangePerWeekPct.toFixed(
                          2
                        )}%)`
                      : ''}
                  </Typography>

                  {insightData.ai?.disclaimer ? (
                    <Typography variant='caption' color='text.secondary'>
                      {insightData.ai.disclaimer}
                    </Typography>
                  ) : null}
                </Stack>
              </Collapse>
            </Box>
          </Box>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            Click “Generate insight” to get AI guidance.
          </Typography>
        )}
      </Box>
    </Collapse>
  );
};

export default TrendCollapseSection;
