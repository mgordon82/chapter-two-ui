import React from 'react';
import { Stack, Typography } from '@mui/material';
import PlanInput from '../../../features/plan/components/PlanInput';
import InsightsPreview from '../../../features/insights/components/InsightsPreview';

const MealGenerator: React.FC = () => {
  return (
    <Stack spacing={3}>
      <Typography component='h2' variant='h5'>
        Meal Generator
      </Typography>
      <Typography variant='body1' color='text.secondary'>
        Give us your macros, dietary restrictions, and other important
        information about what you'd like in your food.
      </Typography>

      <PlanInput />
      <InsightsPreview />
    </Stack>
  );
};

export default MealGenerator;
