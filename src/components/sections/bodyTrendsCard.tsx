import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import WeighInsPanel from '../../features/checkIns/components/WeighInsPanel';
import HealthKitPanel from '../../features/healthKit/components/HealthKitPanel';
import { useState } from 'react';
import type { MappedCheckIn } from '../../features/checkIns/redux/checkInsSlice';
import AddCheckInDialog from '../../features/checkIns/components/AddCheckInDialog';
import { useAppSelector } from '../../app/hooks';

const BodyTrendsCard = () => {
  const [open, setOpen] = useState(false);
  const [selectedDialogItem, setSelectedDialogItem] =
    useState<MappedCheckIn | null>(null);

  const { loading } = useAppSelector((s) => s.checkIns);

  const handleOpenNewCheckIn = (item?: MappedCheckIn | null) => {
    setSelectedDialogItem(item ?? null);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedDialogItem(null);
  };

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
        <Stack
          spacing={1}
          direction='row'
          justifyContent='space-between'
          mb={2}
        >
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
          <Stack direction='row' gap={1}>
            <HealthKitPanel />
            <Button
              variant='contained'
              onClick={() => handleOpenNewCheckIn()}
              disabled={loading}
              color='info'
            >
              + Add Check-In
            </Button>
          </Stack>
        </Stack>
        <WeighInsPanel handleOpenNewCheckIn={handleOpenNewCheckIn} />
      </CardContent>
      <AddCheckInDialog
        open={open}
        onClose={handleCloseDialog}
        initialDate={selectedDialogItem?.representedDate ?? null}
        initialItem={selectedDialogItem}
      />
    </Card>
  );
};

export default BodyTrendsCard;
