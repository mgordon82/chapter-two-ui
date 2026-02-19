import React from 'react';
import {
  Typography,
  Stack,
  Chip,
  Divider,
  Box,
  List,
  ListItem,
  Paper
} from '@mui/material';
import { useAppSelector } from '../../../app/hooks';
import type { PlanData } from '../../../types/plan';
import { Section } from '../../../components/sections/section';
import { capitalize } from '../../../utils/formatting';

const InsightsPreview: React.FC = () => {
  const planData = useAppSelector((state) => state.insights.plan) as
    | PlanData
    | undefined;

  if (!planData) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Stack spacing={2}>
          <Typography component='h3' variant='h6'>
            Plan Details
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            No plan yet. Enter your macros and generate a plan to preview it
            here.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const { assumptions, meals, notes } = planData;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Stack spacing={2}>
        <Typography component='h3' variant='h6'>
          Plan Details
        </Typography>

        <Typography variant='body2' color='text.secondary'>
          {assumptions.notes}
        </Typography>

        <Typography variant='body2' color='text.secondary'>
          {notes}
        </Typography>

        <Divider />

        <Box>
          {meals.map((meal) => {
            const key = `${meal.mealType}-${meal.name}`;

            return (
              <Box key={key} mb={3}>
                <Section title={capitalize(meal.mealType)}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    gap={3}
                    justifyContent='space-between'
                  >
                    <Stack spacing={0.5} flex={1}>
                      <Typography variant='subtitle1'>{meal.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {meal.description}
                      </Typography>
                      <Typography variant='body2'>
                        <strong>Portion:</strong> {meal.portionGuidance}
                      </Typography>

                      {meal.swapOptions?.length ? (
                        <>
                          <Typography variant='body2' mt={1}>
                            <strong>Substitutions (optional)</strong>
                          </Typography>
                          <List dense>
                            {meal.swapOptions.map((option) => (
                              <ListItem key={option} sx={{ py: 0 }}>
                                {capitalize(option)}
                              </ListItem>
                            ))}
                          </List>
                        </>
                      ) : null}
                    </Stack>

                    <Stack spacing={1} minWidth={180}>
                      <Stack>
                        <Typography variant='caption' color='text.secondary'>
                          Calories
                        </Typography>
                        <Chip
                          color='info'
                          label={meal.estimatedMacros.calories}
                        />
                      </Stack>

                      <Stack>
                        <Typography variant='caption' color='text.secondary'>
                          Protein
                        </Typography>
                        <Chip
                          color='success'
                          label={meal.estimatedMacros.protein}
                        />
                      </Stack>

                      <Stack>
                        <Typography variant='caption' color='text.secondary'>
                          Carbs
                        </Typography>
                        <Chip
                          color='warning'
                          label={meal.estimatedMacros.carbs}
                        />
                      </Stack>

                      <Stack>
                        <Typography variant='caption' color='text.secondary'>
                          Fat
                        </Typography>
                        <Chip color='error' label={meal.estimatedMacros.fat} />
                      </Stack>
                    </Stack>
                  </Stack>
                </Section>
                <Divider sx={{ mt: 3 }} />
              </Box>
            );
          })}
        </Box>
      </Stack>
    </Paper>
  );
};

export default InsightsPreview;
