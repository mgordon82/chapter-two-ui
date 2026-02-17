import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Box,
  List,
  ListItem
} from '@mui/material';
import { useAppSelector } from '../../../app/hooks';
import type { PlanData } from '../../../types/plan';

const InsightsPreview: React.FC = () => {
  const planData = useAppSelector((state) => state.insights.plan) as
    | PlanData
    | undefined;

  if (!planData) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={2}>
            <Typography component='h3' variant='h5'>
              Plan Details
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              No plan yet. Enter your macros and generate a plan to preview it
              here.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { assumptions, meals, notes } = planData;

  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={2}>
          <Typography component='h3' variant='h5'>
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
                  <Typography variant='overline' color='text.secondary'>
                    {meal.mealType}
                  </Typography>

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
                                {option}
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
                </Box>
              );
            })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InsightsPreview;
