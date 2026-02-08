import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
  Button,
  Alert
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { planUpdated, planCleared, planAnalysisRequested } from '../planSlice';
import { insightsCleared } from '../../insights/insightsSlice';

const PlanInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    text: planText,
    isAnalyzing,
    error
  } = useAppSelector((state) => state.plan);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(planUpdated(e.target.value));
  };

  const handleClear = () => {
    dispatch(planCleared());
    dispatch(insightsCleared());
  };

  const handleSubmit = () => {
    dispatch(planAnalysisRequested());
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        What are you macro numbers?
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        Give a brief explanation of your macros and any restrictions and we can
        give you some meals that match those numbers.
      </Typography>

      <TextField
        multiline
        minRows={6}
        fullWidth
        value={planText}
        onChange={handleChange}
        placeholder='For example: 160g protein, 130g carbs, 50g fats, no dietary restrictions'
        sx={{ mt: 2 }}
      />
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mt: 2 }}
      >
        <Box>{error !== '' && <Alert severity='error'>{error}</Alert>}</Box>
        <Stack
          direction='row'
          spacing={2}
          justifyContent='flex-end'
          sx={{ mt: 2 }}
        >
          <Button variant='outlined' onClick={handleClear} disabled={!planText}>
            Clear
          </Button>
          <Button
            variant='contained'
            disabled={!planText}
            onClick={handleSubmit}
            loading={isAnalyzing}
            loadingIndicator='Analyzing...'
            sx={{ px: 3 }}
          >
            Analyze
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PlanInput;
