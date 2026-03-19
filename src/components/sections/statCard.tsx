import * as React from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';

type StatCardProps = {
  title: string;
  value: string;
  helper?: React.ReactNode;
  icon?: React.ReactNode;
  chipLabel?: string;
  tone?: 'good' | 'bad' | 'neutral' | 'goal' | 'warn' | 'primary';
  progress?: number | null;
};

const completeSweep = keyframes`
  0% {
    stroke-dashoffset: var(--ring-circumference);
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const completeGlow = keyframes`
  0% {
    box-shadow:
      0 0 0 0 rgba(46,125,50,0.45),
      0 0 8px 2px rgba(46,125,50,0.35);
  }
  50% {
    box-shadow:
      0 0 0 14px rgba(46,125,50,0.12),
      0 0 18px 6px rgba(46,125,50,0.28);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(46,125,50,0),
      0 0 8px 2px rgba(46,125,50,0.25);
  }
`;

const completePop = keyframes`
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
`;

const StatCard = ({
  title,
  value,
  helper,
  icon,
  chipLabel,
  tone = 'neutral',
  progress
}: StatCardProps) => {
  const normalizedProgress =
    progress == null ? null : Math.max(0, Math.min(100, progress));

  const isComplete = progress != null && progress >= 100;
  const displayTone = isComplete ? 'good' : tone;

  const toneStyles =
    displayTone === 'good'
      ? {
          border: '1px solid',
          borderColor: 'success.light',
          background:
            'linear-gradient(135deg, rgba(46,125,50,0.14), rgba(46,125,50,0.03))'
        }
      : displayTone === 'bad'
      ? {
          border: '1px solid',
          borderColor: 'error.light',
          background:
            'linear-gradient(135deg, rgba(211,47,47,0.14), rgba(211,47,47,0.03))'
        }
      : displayTone === 'warn'
      ? {
          border: '1px solid',
          borderColor: 'warning.light',
          background:
            'linear-gradient(135deg, rgba(255,193,7,0.14), rgba(255,193,7,0.03))'
        }
      : displayTone === 'goal'
      ? {
          border: '1px solid',
          borderColor: 'info.light',
          background:
            'linear-gradient(135deg, rgba(2,136,209,0.14), rgba(2,136,209,0.03))'
        }
      : displayTone === 'primary'
      ? {
          border: '1px solid',
          borderColor: 'primary.light',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(99,102,241,0.04))'
        }
      : {
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.03))'
        };

  const iconToneStyles =
    displayTone === 'good'
      ? {
          backgroundColor: 'rgba(46,125,50,0.18)',
          borderColor: 'success.light'
        }
      : displayTone === 'bad'
      ? {
          backgroundColor: 'rgba(211,47,47,0.14)',
          borderColor: 'error.light'
        }
      : displayTone === 'warn'
      ? {
          backgroundColor: 'rgba(255,193,7,0.16)',
          borderColor: 'warning.light'
        }
      : displayTone === 'goal'
      ? {
          backgroundColor: 'rgba(2,136,209,0.14)',
          borderColor: 'info.light'
        }
      : displayTone === 'primary'
      ? {
          borderColor: 'primary.light',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(99,102,241,0.04))'
        }
      : {
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderColor: 'divider'
        };

  const ringSize = 40;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    normalizedProgress == null
      ? circumference
      : circumference - (normalizedProgress / 100) * circumference;

  const progressStrokeColor =
    displayTone === 'good'
      ? '#2e7d32'
      : displayTone === 'bad'
      ? '#d32f2f'
      : displayTone === 'warn'
      ? '#ed6c02'
      : displayTone === 'goal'
      ? '#0288d1'
      : displayTone === 'primary'
      ? '#6366f1'
      : '#6366f1';

  const iconColor =
    displayTone === 'good'
      ? 'success.main'
      : displayTone === 'bad'
      ? 'error.main'
      : displayTone === 'warn'
      ? 'warning.main'
      : displayTone === 'goal'
      ? 'info.main'
      : displayTone === 'primary'
      ? 'primary.main'
      : 'text.primary';

  return (
    <Card
      elevation={0}
      sx={{
        ...toneStyles,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        minWidth: 0
      }}
    >
      <CardContent
        sx={{
          p: 1.75,
          '&:last-child': { pb: 1.75 },
          flex: 1,
          display: 'flex',
          width: '100%'
        }}
      >
        <Stack
          direction='row'
          spacing={1.25}
          alignItems='flex-start'
          sx={{ width: '100%', minWidth: 0 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              position: 'relative',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}
          >
            {normalizedProgress != null ? (
              <>
                {isComplete ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -6,
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle, rgba(46,125,50,0.25) 0%, transparent 70%)',
                      filter: 'blur(4px)',
                      zIndex: 0,
                      pointerEvents: 'none'
                    }}
                  />
                ) : null}

                <Box
                  component='svg'
                  viewBox={`0 0 ${ringSize} ${ringSize}`}
                  sx={{
                    width: ringSize,
                    height: ringSize,
                    position: 'absolute',
                    inset: 0,
                    transform: 'rotate(-90deg)',
                    zIndex: 1,
                    '--ring-circumference': `${circumference}`
                  }}
                >
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill='none'
                    stroke='rgba(255,255,255,0.16)'
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill='none'
                    stroke={progressStrokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap='round'
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{
                      transition: isComplete
                        ? 'none'
                        : 'stroke 250ms ease, stroke-dashoffset 650ms ease',
                      animation: isComplete
                        ? `${completeSweep} 600ms ease-out`
                        : undefined
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    border: '1px solid',
                    color: iconColor,
                    zIndex: 2,
                    ...iconToneStyles,
                    ...(isComplete
                      ? {
                          backgroundColor: 'success.main',
                          color: 'common.white',
                          borderColor: 'success.light',
                          boxShadow: `
                            0 0 10px rgba(46,125,50,0.6),
                            0 0 20px rgba(46,125,50,0.35)
                          `,
                          animation: `
                            ${completePop} 300ms ease-out,
                            ${completeGlow} 1.6s ease-in-out 300ms infinite
                          `
                        }
                      : null),
                    '& .MuiSvgIcon-root': {
                      fontSize: 18
                    }
                  }}
                >
                  {icon}
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid',
                  color: iconColor,
                  ...iconToneStyles,
                  '& .MuiSvgIcon-root': {
                    fontSize: 18
                  }
                }}
              >
                {icon}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction='row'
              alignItems='flex-start'
              justifyContent='space-between'
              gap={1}
              sx={{ minWidth: 0 }}
            >
              <Typography
                variant='overline'
                sx={{
                  letterSpacing: 0.7,
                  lineHeight: 1.1,
                  minWidth: 0
                }}
              >
                {title}
              </Typography>

              {chipLabel ? (
                <Chip
                  size='small'
                  label={chipLabel}
                  sx={{
                    height: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: 'rgba(255,255,255,0.55)',
                    flexShrink: 0,
                    '& .MuiChip-label': {
                      px: 0.75
                    }
                  }}
                />
              ) : null}
            </Stack>

            <Typography
              sx={{
                mt: 0.35,
                fontSize: { xs: '1.5rem', sm: '1.6rem' },
                lineHeight: 1.1,
                fontWeight: 700,
                wordBreak: 'break-word'
              }}
            >
              {value}
            </Typography>

            {helper ? (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  mt: 0.4,
                  fontSize: '0.82rem',
                  lineHeight: 1.35
                }}
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

export default StatCard;
