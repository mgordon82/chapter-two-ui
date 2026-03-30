import { Box, Card, CardContent, Typography } from '@mui/material';

type RemainingTypes = {
  remainingToGoal: number;
  hasGoal: boolean;
  serverAvgChange: number | null;
  currentWeight: number;
  goalWeight: number;
  displayUnitLabel: 'kg' | 'lb';
};

const RemainingToGoalCard = ({
  remainingToGoal,
  hasGoal,
  serverAvgChange,
  currentWeight,
  goalWeight,
  displayUnitLabel
}: RemainingTypes) => {
  return (
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
                At {Math.abs(serverAvgChange).toFixed(1)} {displayUnitLabel}
                /week, estimate ~
                {Math.ceil(
                  Math.max(0, currentWeight - goalWeight) /
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
                Run Generate Insight to estimate time to goal.
              </Typography>
            )
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
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
              When the scale stalls, focus on consistency for 7–10 days before
              cutting harder.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RemainingToGoalCard;
