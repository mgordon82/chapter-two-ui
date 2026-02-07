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

const InsightsPreview: React.FC = () => {
  const planData = useAppSelector((state) => state.insights.plan);
  console.log('plan data', planData);
  return (
    <Card variant='outlined'>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant='h6'>Plan Details</Typography>
          <Typography variant='body2' color='text.secondary'>
            In a future version, Chapter Two will analyze what you wrote and
            surface tailored insights and resources. For now, these are example
            reflections that show the kind of guidance this tool can offer.
          </Typography>

          <Divider />

          <Box>
            <Typography variant='body2' color='text.secondary' mb={2}>
              {planData?.assumptions.notes}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {planData?.notes}
            </Typography>
          </Box>
          <Stack direction='row' gap={3}>
            <Stack>
              Calories{' '}
              <Chip color='info' label={planData?.dailyTargets.calories} />
            </Stack>
            <Stack>
              Protein{' '}
              <Chip color='success' label={planData?.dailyTargets.protein} />
            </Stack>
            <Stack>
              Carbs{' '}
              <Chip color='warning' label={planData?.dailyTargets.carbs} />
            </Stack>
            <Stack>
              Fat <Chip color='error' label={planData?.dailyTargets.fat} />
            </Stack>
          </Stack>
          <Box>
            {planData?.meals.map((meal, index) => {
              return (
                <Box key={index}>
                  <Typography textTransform='uppercase'>
                    {meal.mealType}
                  </Typography>
                  <Stack direction='row' gap={3} justifyContent='space-between'>
                    <Stack>
                      <Typography>{meal.name}</Typography>
                      <Typography>{meal.description}</Typography>
                      <Typography>{meal.portionGuidance}</Typography>
                      <Typography>Substitutions (optional)</Typography>
                      <List>
                        {meal.swapOptions.length > 0 &&
                          meal.swapOptions.map((option, key) => {
                            return <ListItem key={key}>{option}</ListItem>;
                          })}
                      </List>
                    </Stack>
                    <Stack>
                      <Stack>
                        Calories{' '}
                        <Chip
                          color='info'
                          label={meal.estimatedMacros.calories}
                        />
                      </Stack>
                      <Stack>
                        Protein{' '}
                        <Chip
                          color='success'
                          label={meal.estimatedMacros.protein}
                        />
                      </Stack>
                      <Stack>
                        Carbs{' '}
                        <Chip
                          color='warning'
                          label={meal.estimatedMacros.carbs}
                        />
                      </Stack>
                      <Stack>
                        Fat{' '}
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
