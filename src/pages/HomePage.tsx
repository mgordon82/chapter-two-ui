import React from 'react';
import { Stack, Typography, Paper } from '@mui/material';
import StoryInput from '../features/story/components/StoryInput';
// import StorySummaryCard from '../features/story/components/StorySummaryCard';
import InsightsPreview from '../features/insights/components/InsightsPreview';

const HomePage: React.FC = () => {
  return (
    <Stack spacing={3}>
      <Typography variant='body1' color='text.secondary'>
        Give us your macros, dietary restrictions, and other important
        information about what you'd like in your food.
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <StoryInput />
      </Paper>
      {/* <StorySummaryCard /> */}
      <InsightsPreview />
    </Stack>
  );
};

export default HomePage;
