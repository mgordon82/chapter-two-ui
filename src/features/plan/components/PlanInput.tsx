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
import type { MacroResult } from '../../nutritionCalculator/calculations/dailyMacros';

type MacroField = 'calories' | 'protein' | 'carbs' | 'fat';

const toStr = (v: number | null | undefined) => (v == null ? '' : String(v));

const PlanInput: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    macros: planMacros,
    details,
    isAnalyzing,
    error
  } = useAppSelector((state) => state.plan);

  const savedMacros = useAppSelector(
    (state) => state.nutritionCalculator.lastSubmitted?.macros ?? null
  );

  const [openMoreDetails, setOpenMoreDetails] = React.useState(false);

  React.useEffect(() => {
    if (!savedMacros) return;

    const planEmpty =
      planMacros.calories === '' &&
      planMacros.protein === '' &&
      planMacros.carbs === '' &&
      planMacros.fat === '';

    if (!planEmpty) return;

    dispatch(
      macroFieldUpdated({
        field: 'calories',
        value: toStr(savedMacros.calories)
      })
    );
    dispatch(
      macroFieldUpdated({ field: 'protein', value: toStr(savedMacros.protein) })
    );
    dispatch(
      macroFieldUpdated({ field: 'carbs', value: toStr(savedMacros.carbs) })
    );
    dispatch(
      macroFieldUpdated({
        field: 'fat',
        value: toStr(
          (savedMacros as MacroResult).fat ?? (savedMacros as MacroResult).fat
        )
      })
    );
  }, [
    dispatch,
    savedMacros,
    planMacros.calories,
    planMacros.protein,
    planMacros.carbs,
    planMacros.fat
  ]);

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
    setOpenMoreDetails((v) => !v);
  };

  const handleSubmit = () => {
    dispatch(planAnalysisRequested());
  };

  const allFilled =
    planMacros.calories !== '' &&
    planMacros.protein !== '' &&
    planMacros.carbs !== '' &&
    planMacros.fat !== '';

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
            value={planMacros.calories}
            onChange={handleMacroChange('calories')}
            inputProps={{ min: 0, step: 1 }}
          />

          <TextField
            label='Protein (g)'
            type='number'
            required
            fullWidth
            value={planMacros.protein}
            onChange={handleMacroChange('protein')}
            inputProps={{ min: 0, step: 1 }}
          />

          <TextField
            label='Carbs (g)'
            type='number'
            required
            fullWidth
            value={planMacros.carbs}
            onChange={handleMacroChange('carbs')}
            inputProps={{ min: 0, step: 1 }}
          />

          <TextField
            label='Fats (g)'
            type='number'
            required
            fullWidth
            value={planMacros.fat}
            onChange={handleMacroChange('fat')}
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
              sx={{ px: 3 }}
              loading={isAnalyzing}
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
