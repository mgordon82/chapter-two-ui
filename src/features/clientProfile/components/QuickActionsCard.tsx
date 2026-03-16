import React from 'react';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import MonitorWeightOutlinedIcon from '@mui/icons-material/MonitorWeightOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

type QuickActionsCardProps = {
  onAddCheckIn?: () => void;
  onViewCheckInHistory?: () => void;
  onOpenPhotoHistory?: () => void;
  onEditNutritionPlan?: () => void;
};

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onAddCheckIn,
  onViewCheckInHistory,
  onOpenPhotoHistory,
  onEditNutritionPlan
}) => {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 2 }}>
          <FitnessCenterOutlinedIcon fontSize='small' />
          <Typography variant='h6' fontWeight={700}>
            Quick Actions
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          useFlexGap
          flexWrap='wrap'
        >
          <Button
            variant='outlined'
            startIcon={<CalendarTodayOutlinedIcon />}
            onClick={onAddCheckIn}
            disabled={!onAddCheckIn}
          >
            Add Check-In
          </Button>

          <Button
            variant='outlined'
            startIcon={<MonitorWeightOutlinedIcon />}
            onClick={onViewCheckInHistory}
            disabled={!onViewCheckInHistory}
          >
            View Check-In History
          </Button>

          <Button
            variant='outlined'
            startIcon={<CameraAltOutlinedIcon />}
            onClick={onOpenPhotoHistory}
            disabled={!onOpenPhotoHistory}
          >
            Open Photo History
          </Button>

          <Button
            variant='outlined'
            startIcon={<RestaurantMenuOutlinedIcon />}
            onClick={onEditNutritionPlan}
            disabled={!onEditNutritionPlan}
          >
            Edit Nutrition Plan
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
