import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import type { ClientNutrition } from '../types';

type NutritionTargetsCardProps = {
  nutrition: ClientNutrition;
};

const labelSx = {
  fontSize: '0.78rem',
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: 0.6
};

const valueSx = {
  fontSize: '0.98rem',
  fontWeight: 600,
  color: 'text.primary'
};

const MetricItem: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <Stack spacing={0.4}>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value ?? '—'}</Typography>
  </Stack>
);

const MacroPill: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <Paper
    variant='outlined'
    sx={{
      px: 1.5,
      py: 1.25,
      borderRadius: 2,
      minWidth: 92
    }}
  >
    <Typography sx={labelSx}>{label}</Typography>
    <Typography fontWeight={700}>{value}</Typography>
  </Paper>
);

const formatGoalType = (value?: string | null) => {
  if (!value) return '—';

  switch (value) {
    case 'fat_loss':
      return 'Fat Loss';
    case 'maintenance':
      return 'Maintenance';
    case 'muscle_gain':
      return 'Muscle Gain';
    case 'recomp':
      return 'Recomp';
    default:
      return value;
  }
};

const formatActivityLevel = (value?: string | null) => {
  if (!value) return '—';

  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const NutritionTargetsCard: React.FC<NutritionTargetsCardProps> = ({
  nutrition
}) => {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid'
            }}
          >
            <RestaurantMenuOutlinedIcon fontSize='small' />
          </Box>
          <Typography variant='h6' fontWeight={700}>
            Nutrition Targets
          </Typography>
        </Stack>

        <Stack direction='row' spacing={1.25} flexWrap='wrap' useFlexGap>
          <MacroPill
            label='Calories'
            value={
              nutrition.calorieTarget != null
                ? `${nutrition.calorieTarget}`
                : '—'
            }
          />
          <MacroPill
            label='Protein'
            value={
              nutrition.macros.proteinGrams != null
                ? `${nutrition.macros.proteinGrams}g`
                : '—'
            }
          />
          <MacroPill
            label='Carbs'
            value={
              nutrition.macros.carbsGrams != null
                ? `${nutrition.macros.carbsGrams}g`
                : '—'
            }
          />
          <MacroPill
            label='Fats'
            value={
              nutrition.macros.fatGrams != null
                ? `${nutrition.macros.fatGrams}g`
                : '—'
            }
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          <MetricItem
            label='Meal Style'
            value={nutrition.mealPlanStyle || '—'}
          />
          <MetricItem
            label='Phase'
            value={formatGoalType(nutrition.phase) || '—'}
          />
          <MetricItem
            label='Water Target'
            value={
              nutrition.waterTargetOz != null
                ? `${nutrition.waterTargetOz} oz`
                : '—'
            }
          />
          <MetricItem
            label='Fiber Target'
            value={
              nutrition.fiberTargetGrams != null
                ? `${nutrition.fiberTargetGrams}g`
                : '—'
            }
          />
          <MetricItem
            label='Goal Type'
            value={formatGoalType(nutrition.calculatedFrom?.goalType)}
          />
          <MetricItem
            label='Activity Level'
            value={formatActivityLevel(nutrition.calculatedFrom?.activityLevel)}
          />
          <MetricItem
            label='Weekly Goal Rate'
            value={
              nutrition.calculatedFrom?.weeklyGoalRate != null
                ? `${nutrition.calculatedFrom.weeklyGoalRate}`
                : '—'
            }
          />
          <MetricItem
            label='Last Updated'
            value={formatDate(nutrition.lastUpdatedAt)}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NutritionTargetsCard;
