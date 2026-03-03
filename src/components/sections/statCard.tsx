import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

const StatCard = ({
  title,
  value,
  helper,
  icon,
  chipLabel,
  tone = 'neutral'
}: {
  title: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
  chipLabel?: string;
  tone?: 'good' | 'bad' | 'neutral' | 'goal' | 'warn' | 'primary';
}) => {
  const toneStyles =
    tone === 'good'
      ? {
          border: '1px solid',
          borderColor: 'success.light',
          background:
            'linear-gradient(135deg, rgba(46,125,50,0.14), rgba(46,125,50,0.03))'
        }
      : tone === 'bad'
      ? {
          border: '1px solid',
          borderColor: 'error.light',
          background:
            'linear-gradient(135deg, rgba(211,47,47,0.14), rgba(211,47,47,0.03))'
        }
      : tone === 'warn'
      ? {
          border: '1px solid',
          borderColor: 'warning.light',
          background:
            'linear-gradient(135deg, rgba(255,193,7,0.14), rgba(255,193,7,0.03))'
        }
      : tone === 'goal'
      ? {
          border: '1px solid',
          borderColor: 'info.light',
          background:
            'linear-gradient(135deg, rgba(2,136,209,0.14), rgba(2,136,209,0.03))'
        }
      : tone === 'primary'
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
    tone === 'good'
      ? {
          backgroundColor: 'rgba(46,125,50,0.14)',
          borderColor: 'success.light'
        }
      : tone === 'bad'
      ? {
          backgroundColor: 'rgba(211,47,47,0.14)',
          borderColor: 'error.light'
        }
      : tone === 'warn'
      ? {
          backgroundColor: 'rgba(255,193,7,0.16)',
          borderColor: 'warning.light'
        }
      : tone === 'goal'
      ? {
          backgroundColor: 'rgba(2,136,209,0.14)',
          borderColor: 'info.light'
        }
      : tone === 'primary'
      ? {
          border: '1px solid',
          borderColor: 'primary.light',
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(99,102,241,0.04))'
        }
      : {
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderColor: 'divider'
        };

  return (
    <Card
      elevation={0}
      sx={{
        ...toneStyles,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%'
      }}
    >
      <CardContent sx={{ p: 2.25, flex: 1, display: 'flex', width: '100%' }}>
        <Stack
          direction='row'
          spacing={1.5}
          alignItems='flex-start'
          sx={{ width: '100%' }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid',
              flexShrink: 0,
              ...iconToneStyles
            }}
          >
            {icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              gap={1}
            >
              <Typography variant='overline' sx={{ letterSpacing: 0.8 }}>
                {title}
              </Typography>

              {chipLabel ? (
                <Chip
                  size='small'
                  label={chipLabel}
                  sx={{
                    height: 22,
                    fontSize: 12,
                    backgroundColor: 'rgba(255,255,255,0.55)'
                  }}
                />
              ) : null}
            </Stack>

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

export default StatCard;
