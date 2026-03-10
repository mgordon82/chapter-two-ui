import React, { useEffect } from 'react';
import {
  AppBar,
  Link,
  Toolbar,
  Typography,
  Stack,
  IconButton,
  Drawer,
  useMediaQuery,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import MacroItem from '../macroItem';
import { useAppSelector } from '../../app/hooks';
import { Link as RouterLink } from 'react-router-dom';

import NavDrawer from '../sections/navDrawer';
import { useDispatch } from 'react-redux';
import { loadUserProfileRequested } from '../../features/nutritionCalculator/redux/nutritionCalculatorSlice';
import { Capacitor } from '@capacitor/core';

const drawerWidth = 240;
const nativeHeaderPadding = '30px';

const Header: React.FC = () => {
  const isNative = Capacitor.isNativePlatform();
  const dispatch = useDispatch();
  const isDesktop = useMediaQuery('(min-width:900px)');

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const macros = useAppSelector(
    (state) =>
      state.nutritionCalculator?.loadedProfile?.nutrition?.targets ?? null
  );

  const toggleMobileDrawer = () => setMobileOpen((v) => !v);

  useEffect(() => {
    dispatch(loadUserProfileRequested());
  }, [dispatch]);

  return (
    <>
      <AppBar
        position='sticky'
        elevation={0}
        color='transparent'
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          pt: isNative
            ? `calc(env(safe-area-inset-top) + ${nativeHeaderPadding})`
            : 0
        }}
      >
        {isDesktop ? (
          <Toolbar sx={{ px: 2, minHeight: 72 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              flexGrow={1}
              width='100%'
            >
              <Stack direction='row' alignItems='center' gap={2}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  sx={{ letterSpacing: 0.5, textTransform: 'uppercase' }}
                >
                  <Link
                    component={RouterLink}
                    to='/app'
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
                    value={macros.fats || 0}
                    unit='g'
                    color='#DC2626'
                  />
                </Stack>
              )}
            </Stack>
          </Toolbar>
        ) : (
          <Box sx={{ px: 1.5, py: 1 }}>
            <Toolbar
              disableGutters
              sx={{
                minHeight: 56,
                px: 0,
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Stack direction='row' alignItems='center' gap={1}>
                <IconButton
                  onClick={toggleMobileDrawer}
                  aria-label='open navigation'
                  size='medium'
                  sx={{ ml: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>

                <Typography
                  variant='h6'
                  fontWeight={700}
                  sx={{
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    lineHeight: 1
                  }}
                >
                  <Link
                    component={RouterLink}
                    to='/app'
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
            </Toolbar>

            {macros && (
              <Box
                sx={{
                  mt: 0.5,
                  px: 0.5,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                  justifyItems: 'end'
                }}
              >
                <Stack
                  direction='row'
                  alignItems='flex-end'
                  justifyContent='space-evenly'
                  gap={2}
                  width='100%'
                  sx={{
                    minWidth: 'max-content',
                    pb: 0.5
                  }}
                >
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
                    value={macros.fats || 0}
                    unit='g'
                    color='#DC2626'
                  />
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </AppBar>

      <Drawer
        variant='temporary'
        open={mobileOpen}
        onClose={toggleMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            pt: isNative
              ? `calc(env(safe-area-inset-top) + ${nativeHeaderPadding})`
              : 0
          }
        }}
      >
        <NavDrawer setMobileOpen={setMobileOpen} />
      </Drawer>

      <Drawer
        variant='persistent'
        open={isDesktop}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
      >
        <NavDrawer setMobileOpen={setMobileOpen} />
      </Drawer>
    </>
  );
};

export default Header;
