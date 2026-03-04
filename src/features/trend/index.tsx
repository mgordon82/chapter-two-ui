import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { trendAnalyzeRequested, type TrendState } from './redux/trendSlice';
import { kgToLbs } from '../../utils/conversions/weight';

const clamp = (lines: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden'
});

type WeightUnitPref = 'kg' | 'lbs';

type TrendAnalysisCardProps = {
  trend: TrendState;
  displayUnitLabel: 'kg' | 'lb';
  unitPref: WeightUnitPref;
};

const TrendAnalysisCard = ({
  trend,
  displayUnitLabel,
  unitPref
}: TrendAnalysisCardProps) => {
  const dispatch = useAppDispatch();

  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [showFullQuickRead, setShowFullQuickRead] = useState(false);
  const [showFullRationale, setShowFullRationale] = useState(false);

  const toDisplayWeight = (kg: number): number =>
    unitPref === 'lbs' ? kgToLbs(kg) : kg;

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
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent='space-between'
            spacing={1.5}
          >
            <Stack
              direction='row'
              spacing={1.25}
              alignItems='center'
              sx={{ minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0
                }}
              >
                <AutoAwesomeIcon fontSize='small' />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant='subtitle1'
                  sx={{ fontWeight: 700, lineHeight: 1.1 }}
                >
                  Trend Analysis
                </Typography>

                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: { xs: 2, sm: 'unset' },
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
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
              fullWidth={false}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                alignSelf: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: 160 },
                whiteSpace: 'nowrap',
                py: { xs: 1.1, sm: 0.8 }
              }}
            >
              <Box
                component='span'
                sx={{ display: { xs: 'inline', sm: 'none' } }}
              >
                {showAnalyze ? 'Hide' : 'Analyze'}
              </Box>

              <Box
                component='span'
                sx={{ display: { xs: 'none', sm: 'inline' } }}
              >
                {showAnalyze ? 'Hide analysis' : 'Analyze trend'}
              </Box>
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
                        <Typography variant='caption' color='text.secondary'>
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
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
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

                    <Collapse in={showTrendDetails} timeout={150} unmountOnExit>
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
                          <Typography variant='caption' color='text.secondary'>
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
  );
};

export default TrendAnalysisCard;
