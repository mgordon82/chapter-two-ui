import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
  Button,
  Alert,
  Paper
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  macroFieldUpdated,
  planCleared,
  planAnalysisRequested,
  detailsUpdated
} from '../planSlice';
import { insightsCleared } from '../../insights/insightsSlice';

type MacroField = 'calories' | 'protein' | 'carbs' | 'fats';

const PlanInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const { macros, details, isAnalyzing, error } = useAppSelector(
    (state) => state.plan
  );

  const [openMoreDetails, setOpenMoreDetails] = React.useState(false);

  const handleMacroChange =
    (field: MacroField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(macroFieldUpdated({ field, value: e.target.value }));
    };

  const handleMoreDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(detailsUpdated(e.target.value));
  };

  const handleClear = () => {
    dispatch(planCleared());
    dispatch(insightsCleared());
  };

  const handleOpenDetails = () => {
    setOpenMoreDetails(!openMoreDetails);
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
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2 },
        borderRadius: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Box>
        <Typography component='h3' variant='h6' gutterBottom>
          What are your macro numbers?
        </Typography>

        <Typography variant='body2' color='text.secondary' gutterBottom>
          Enter your daily targets. All fields are required.
        </Typography>

        <Stack spacing={2} sx={{ my: 2 }}>
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

        <Stack direction='row' justifyContent='right' flexGrow={0}>
          <Button variant='text' onClick={handleOpenDetails}>
            + Add Details
          </Button>
        </Stack>
        {openMoreDetails && (
          <Stack flexGrow={1}>
            <Typography>Additional Details</Typography>
            <TextField
              multiline
              minRows={3}
              fullWidth
              value={details}
              onChange={handleMoreDetails}
              placeholder='Add additional details like dietary restrictions or preferences'
              sx={{ mt: 2 }}
            />
          </Stack>
        )}

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
            <Button variant='outlined' onClick={handleClear}>
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
    </Paper>
  );
};

export default PlanInput;
