import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { useAppSelector } from '../../../app/hooks';

const MAX_PREVIEW_CHARS = 260;

const PlanSummaryCard: React.FC = () => {
  const planText = useAppSelector((state) => state.plan.text.trim());

  const preview =
    planText.length > MAX_PREVIEW_CHARS
      ? planText.slice(0, MAX_PREVIEW_CHARS) + '…'
      : planText;

  const isEmpty = planText.length === 0;

  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6'>Your plan so far</Typography>
            {!isEmpty && (
              <Chip
                size='small'
                label={`${planText.length} character${
                  planText.length === 1 ? '' : 's'
                }`}
              />
            )}
          </Stack>

          {isEmpty ? (
            <Typography variant='body2' color='text.secondary'>
              Start typing above to see a summary of your plan here. This area
              will eventually power insights and resource suggestions.
            </Typography>
          ) : (
            <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
              {preview}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PlanSummaryCard;
