import React from 'react';
import { AppBar, Link, Toolbar, Typography, Stack } from '@mui/material';
import MacroItem from '../macroItem';
import { useAppSelector } from '../../app/hooks';
import type { PlanData } from '../../types/plan';
import { Link as RouterLink } from 'react-router-dom';

const Header: React.FC = () => {
  const planData = useAppSelector((state) => state.insights.plan) as
    | PlanData
    | undefined;
  return (
    <AppBar
      position='sticky'
      elevation={0}
      color='transparent'
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar sx={{ px: 0, minHeight: 64 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          flexGrow={1}
        >
          <Stack direction='row' alignItems='flex-end' gap={2}>
            <Typography
              variant='h5'
              fontWeight={700}
              sx={{
                letterSpacing: 0.5,
                textTransform: 'uppercase'
              }}
            >
              <Link
                component={RouterLink}
                to='/'
                underline='none'
                color='inherit'
                sx={{
                  '&:hover': {
                    color: 'inherit',
                    textDecoration: 'none'
                  }
                }}
              >
                Chapter Two
              </Link>
            </Typography>
          </Stack>
          {planData?.dailyTargets && (
            <Stack direction='row' alignItems='flex-end' gap={3}>
              <MacroItem
                name='Calories'
                value={planData?.dailyTargets.calories || 0}
                unit='kcal'
                color='#2563EB'
              />
              <MacroItem
                name='Protein'
                value={planData?.dailyTargets.protein || 0}
                unit='g'
                color='#16A34A'
              />

              <MacroItem
                name='Carbs'
                value={planData?.dailyTargets.carbs || 0}
                unit='g'
                color='#F59E0B'
              />

              <MacroItem
                name='Fat'
                value={planData?.dailyTargets.fat || 0}
                unit='g'
                color='#DC2626'
              />
            </Stack>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
