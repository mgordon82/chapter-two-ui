import React from 'react';
import {
  AppBar,
  Link,
  Toolbar,
  Typography,
  Stack,
  IconButton,
  Drawer,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import MacroItem from '../macroItem';
import { useAppSelector } from '../../app/hooks';
import { Link as RouterLink } from 'react-router-dom';

import NavDrawer from '../sections/navDrawer';

const drawerWidth = 240;

const Header: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width:900px)');

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const macros = useAppSelector(
    (state) => state.nutritionCalculator.lastSubmitted?.macros
  );

  const toggleMobileDrawer = () => setMobileOpen((v) => !v);

  return (
    <>
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
              {!isDesktop && (
                <IconButton
                  onClick={toggleMobileDrawer}
                  aria-label='open navigation'
                  size='medium'
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Typography
                variant='h5'
                fontWeight={700}
                sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
              >
                <Link
                  component={RouterLink}
                  to='/'
                  underline='none'
                  color='inherit'
                  sx={{
                    '&:hover': { color: 'inherit', textDecoration: 'none' }
                  }}
                >
                  Chapter Two
                </Link>
              </Typography>
            </Stack>

            {macros && (
              <Stack direction='row' alignItems='flex-end' gap={3}>
                <MacroItem
                  name='Calories'
                  value={macros.calories || 0}
                  unit='kcal'
                  color='#2563EB'
                />
                <MacroItem
                  name='Protein'
                  value={macros.protein || 0}
                  unit='g'
                  color='#16A34A'
                />
                <MacroItem
                  name='Carbs'
                  value={macros.carbs || 0}
                  unit='g'
                  color='#F59E0B'
                />
                <MacroItem
                  name='Fat'
                  value={macros.fat || 0}
                  unit='g'
                  color='#DC2626'
                />
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth }
        }}
      >
        <NavDrawer setMobileOpen={setMobileOpen} />
      </Drawer>

      <Drawer
        variant='persistent'
        open={isDesktop}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        <NavDrawer setMobileOpen={setMobileOpen} />
      </Drawer>
    </>
  );
};

export default Header;
