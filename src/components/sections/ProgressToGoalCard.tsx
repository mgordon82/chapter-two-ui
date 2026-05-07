import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

type ProgressTypes = {
  progressPct: number;
  progressLost: number;
  totalToLose: number;
  displayUnitLabel: 'kg' | 'lb';
};

const ProgressToGoalCard = ({
  progressPct,
  progressLost,
  totalToLose,
  displayUnitLabel
}: ProgressTypes) => {
  return (
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
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            {progressLost.toFixed(1)} {displayUnitLabel} lost of{' '}
            {totalToLose.toFixed(1)} {displayUnitLabel} total
          </Typography>

          <Box sx={{ flex: 1 }} />

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
  );
};

export default ProgressToGoalCard;
