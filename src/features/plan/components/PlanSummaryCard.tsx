import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { useAppSelector } from '../../../app/hooks';

const PlanSummaryCard: React.FC = () => {
  const { macros } = useAppSelector((state) => state.plan);

  const isEmpty =
    macros.calories === '' &&
    macros.protein === '' &&
    macros.carbs === '' &&
    macros.fats === '';

  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>Your macro targets</Typography>
            {!isEmpty && <Chip size='small' label='Structured input' />}
          </Stack>

          {isEmpty ? (
            <Typography variant='body2' color='text.secondary'>
              Enter your daily calories and macros above to see a summary here.
              These targets will be used to generate meals and insights.
            </Typography>
          ) : (
            <Stack spacing={0.5}>
              <Typography variant='body1'>
                <strong>Calories:</strong> {macros.calories}
              </Typography>
              <Typography variant='body1'>
                <strong>Protein:</strong> {macros.protein} g
              </Typography>
              <Typography variant='body1'>
                <strong>Carbs:</strong> {macros.carbs} g
              </Typography>
              <Typography variant='body1'>
                <strong>Fats:</strong> {macros.fats} g
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PlanSummaryCard;
