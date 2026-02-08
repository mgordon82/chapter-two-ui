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
import {
  macroFieldUpdated,
  planCleared,
  planAnalysisRequested
} from '../planSlice';
import { insightsCleared } from '../../insights/insightsSlice';

type MacroField = 'calories' | 'protein' | 'carbs' | 'fats';

const PlanInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const { macros, isAnalyzing, error } = useAppSelector((state) => state.plan);

  const handleMacroChange =
    (field: MacroField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(macroFieldUpdated({ field, value: e.target.value }));
    };

  const handleClear = () => {
    dispatch(planCleared());
    dispatch(insightsCleared());
  };

  const handleSubmit = () => {
    dispatch(planAnalysisRequested());
  };

  const allFilled =
    macros.calories !== '' &&
    macros.protein !== '' &&
    macros.carbs !== '' &&
    macros.fats !== '';

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        What are your macro numbers?
      </Typography>

      <Typography variant='body2' color='text.secondary' gutterBottom>
        Enter your daily targets. All fields are required.
      </Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label='Calories'
          type='number'
          required
          fullWidth
          value={macros.calories}
          onChange={handleMacroChange('calories')}
          inputProps={{ min: 0, step: 1 }}
        />

        <TextField
          label='Protein (g)'
          type='number'
          required
          fullWidth
          value={macros.protein}
          onChange={handleMacroChange('protein')}
          inputProps={{ min: 0, step: 1 }}
        />

        <TextField
          label='Carbs (g)'
          type='number'
          required
          fullWidth
          value={macros.carbs}
          onChange={handleMacroChange('carbs')}
          inputProps={{ min: 0, step: 1 }}
        />

        <TextField
          label='Fats (g)'
          type='number'
          required
          fullWidth
          value={macros.fats}
          onChange={handleMacroChange('fats')}
          inputProps={{ min: 0, step: 1 }}
        />
      </Stack>

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
          <Button
            variant='outlined'
            onClick={handleClear}
            disabled={!allFilled}
          >
            Clear
          </Button>

          <Button
            variant='contained'
            disabled={!allFilled}
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
