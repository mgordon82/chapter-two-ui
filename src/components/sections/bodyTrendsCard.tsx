import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import WeighInsPanel from '../../features/checkIns/components/WeighInsPanel';

const BodyTrendsCard = () => {
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
                Body Trends
              </Typography>
            </Box>
          </Stack>

          <WeighInsPanel />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BodyTrendsCard;
