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

// If you're already using MUI icons, these help the visual language a lot.
// Safe to remove if you don't want icons yet.
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlagIcon from '@mui/icons-material/Flag';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InsightsIcon from '@mui/icons-material/Insights';

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
  // Static placeholder (no chart lib yet).
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
              <Typography variant='body2' color='text.secondary'>
                Static placeholder (chart comes next)
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 1,
              height: 280,
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
              backgroundColor: 'rgba(255,255,255,0.55)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Simple “fake chart” strokes */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.9,
                background:
                  'radial-gradient(circle at 20% 30%, rgba(2,136,209,0.20), transparent 60%), radial-gradient(circle at 70% 70%, rgba(46,125,50,0.18), transparent 55%)'
              }}
            />
            <Stack
              sx={{ height: '100%', p: 2.5, position: 'relative' }}
              justifyContent='space-between'
            >
              <Typography variant='caption' color='text.secondary'>
                180
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                170
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                160
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                150
              </Typography>
            </Stack>

            <Box
              sx={{
                position: 'absolute',
                left: 18,
                right: 18,
                top: 24,
                bottom: 24,
                borderRadius: 2,
                background:
                  'linear-gradient(180deg, rgba(2,136,209,0.10), rgba(2,136,209,0))'
              }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [showAnalyze, setShowAnalyze] = React.useState(false);

  // Static demo values
  const currentWeight = 168.4;
  const goalWeight = 140.0;
  const avgChangePerWeek = -0.6;

  const progressLost = 170 - currentWeight; // example starting point
  const totalToLose = 170 - goalWeight;
  const progressPct =
    totalToLose > 0
      ? Math.min(100, Math.max(0, (progressLost / totalToLose) * 100))
      : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2.25} sx={{ width: '100%' }}>
        {/* Collapsible Analyze section */}
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
                    progress stalls for 10–14 days, we’ll ask a few questions
                    (adherence, steps, workouts, sleep) and recommend a small
                    7–10 day experiment (macro tweak or activity bump).
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

        {/* Row 1: 3 cards */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 1 }}>
            <StatCard
              title='Current Weight'
              value={`${currentWeight.toFixed(1)} lb`}
              helper='Last check-in: Feb 24'
              icon={<TrendingDownIcon fontSize='small' />}
              tone='neutral'
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatCard
              title='Goal Weight'
              value={`${goalWeight.toFixed(1)} lb`}
              helper='Target: 140 by June'
              icon={<FlagIcon fontSize='small' />}
              tone='goal'
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatCard
              title='Avg Change / Week'
              value={`${
                avgChangePerWeek > 0 ? '+' : ''
              }${avgChangePerWeek.toFixed(1)} lb`}
              helper='Based on last 4 weeks'
              icon={<TimelineIcon fontSize='small' />}
              tone={avgChangePerWeek <= 0 ? 'good' : 'bad'}
            />
          </Box>
        </Stack>

        {/* Row 2: full width chart */}
        <PlaceholderChart />

        {/* Row 3: progress cards (two cards for now) */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems='stretch'
          sx={{ width: '100%' }}
        >
          {/* CHANGE 1: wrapper Box uses display:flex so child card can stretch */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                background:
                  'linear-gradient(135deg, rgba(46,125,50,0.10), rgba(46,125,50,0.02))',
                // CHANGE 2: make card fill wrapper height
                width: '100%'
              }}
            >
              {/* CHANGE 3: make CardContent flex column so we can push bar to bottom */}
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
                  Example: {progressLost.toFixed(1)} lb lost of{' '}
                  {totalToLose.toFixed(1)} lb
                </Typography>

                {/* spacer pushes progress bar to bottom so both cards balance */}
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

          {/* CHANGE 1: wrapper Box uses display:flex so child card can stretch */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                background:
                  'linear-gradient(135deg, rgba(2,136,209,0.10), rgba(2,136,209,0.02))',
                // CHANGE 2: make card fill wrapper height
                width: '100%'
              }}
            >
              {/* CHANGE 3: make CardContent flex column so tip can sit at bottom */}
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
                  {(currentWeight - goalWeight).toFixed(1)} lb
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 0.5 }}
                >
                  At {Math.abs(avgChangePerWeek).toFixed(1)} lb/week, estimate ~
                  {Math.ceil(
                    (currentWeight - goalWeight) /
                      Math.max(0.1, Math.abs(avgChangePerWeek))
                  )}{' '}
                  weeks
                </Typography>

                {/* spacer pushes tip box to bottom to match left card */}
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
