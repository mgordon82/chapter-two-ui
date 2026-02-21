import React from 'react';
import {
  AppBar,
  Link,
  Toolbar,
  Typography,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  Avatar,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LogoutIcon from '@mui/icons-material/Logout';

import MacroItem from '../macroItem';
import { useAppSelector } from '../../app/hooks';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutRequested } from '../../auth/authSlice';

const drawerWidth = 240;

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width:900px)');

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const macros = useAppSelector(
    (state) => state.nutritionCalculator.lastSubmitted?.macros
  );

  const user = useAppSelector((state) => state.auth.currentUser);

  const toggleMobileDrawer = () => setMobileOpen((v) => !v);
  const closeMobileDrawer = () => setMobileOpen(false);

  const handleLogout = () => {
    dispatch(logoutRequested());
  };

  const navItems = [
    {
      label: 'Meal Generator',
      path: '/app/meal-generator',
      icon: <RestaurantMenuIcon />
    }
  ];

  const initials = (name?: string | null) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase() || a.toUpperCase() || '?';
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Button
            onClick={() => {
              navigate('/app/nutrition-profile');
              closeMobileDrawer();
            }}
          >
            <Avatar sx={{ width: 40, height: 40 }}>
              {initials(user?.displayName)}
            </Avatar>
          </Button>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant='subtitle1' fontWeight={700} noWrap>
              {user?.displayName ?? 'Welcome'}
            </Typography>

            <Typography variant='body2' color='text.secondary' noWrap>
              {user?.email ?? ''}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Nav */}
      <List sx={{ px: 1, pt: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.label}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                closeMobileDrawer();
              }}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                my: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'action.selected',
                  '&:hover': { bgcolor: 'action.selected' }
                },
                '& .MuiListItemIcon-root': {
                  color: selected ? 'text.primary' : 'text.secondary'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Divider />

      {/* Logout */}
      <List sx={{ px: 1, py: 1 }}>
        <ListItemButton
          onClick={() => {
            handleLogout();
            closeMobileDrawer();
          }}
          sx={{
            borderRadius: 2,
            mx: 0.5,
            my: 0.5
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary='Logout' />
        </ListItemButton>
      </List>
    </Box>
  );

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
              {/* Nav trigger (only visible on mobile/tablet) */}
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

      {/* Mobile Drawer */}
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
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer (open by default) */}
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
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;
