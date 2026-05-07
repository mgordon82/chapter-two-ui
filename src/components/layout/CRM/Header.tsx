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

import { Link as RouterLink } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import { loadUserProfileRequested } from '../../../features/nutritionCalculator/redux/nutritionCalculatorSlice';
import { Capacitor } from '@capacitor/core';

import logoImg from '../../../assets/Logo-white.png';
import NavDrawer from '../../navigation/NavDrawer';

const drawerWidth = 240;
const nativeHeaderPadding = '30px';

const Header: React.FC = () => {
  const isNative = Capacitor.isNativePlatform();
  const dispatch = useDispatch();
  const isDesktop = useMediaQuery('(min-width:900px)');

  const [mobileOpen, setMobileOpen] = React.useState(false);

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
              <Stack direction='row' alignItems='flex-end' gap={2}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  sx={{ letterSpacing: 0.5 }}
                >
                  <Link
                    component={RouterLink}
                    to='/crm'
                    underline='none'
                    color='inherit'
                    sx={{
                      '&:hover': { color: 'inherit', textDecoration: 'none' }
                    }}
                  >
                    Chapter Two
                  </Link>
                </Typography>
                <Typography>CRM</Typography>
              </Stack>
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
              <Stack direction='row' alignItems='flex-end' gap={1}>
                <IconButton
                  onClick={toggleMobileDrawer}
                  aria-label='open navigation'
                  size='medium'
                  sx={{ ml: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>
                <Box
                  component='img'
                  src={logoImg}
                  alt={'MiPT logo'}
                  sx={{
                    width: 30
                  }}
                />
                <Typography
                  variant='h6'
                  fontWeight={700}
                  sx={{
                    letterSpacing: 0.5,
                    lineHeight: 1
                  }}
                >
                  <Link
                    component={RouterLink}
                    to='/mipt'
                    underline='none'
                    color='inherit'
                    sx={{
                      '&:hover': { color: 'inherit', textDecoration: 'none' }
                    }}
                  >
                    Chapter Two
                  </Link>
                </Typography>
                <Typography>CRM</Typography>
              </Stack>
            </Toolbar>
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
