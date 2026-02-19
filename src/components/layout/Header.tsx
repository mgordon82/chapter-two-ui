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
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

import MacroItem from '../macroItem';
import { useAppSelector } from '../../app/hooks';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width:900px)');

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const macros = useAppSelector(
    (state) => state.nutritionCalculator.lastSubmitted?.macros
  );

  const toggleMobileDrawer = () => setMobileOpen((v) => !v);
  const closeMobileDrawer = () => setMobileOpen(false);

  const handleLogout = () => {
    // TODO: replace with your real logout behavior (clear auth state, tokens, etc.)
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Client Nutrition Profile',
      path: '/app/nutrition-profile',
      icon: <PersonIcon />
    },
    {
      label: 'Meal Generator',
      path: '/app/meal-generator',
      icon: <RestaurantMenuIcon />
    }
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List sx={{ px: 1 }}>
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
              sx={{ borderRadius: 2, mx: 0.5, my: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flex: 1 }} />

      <Divider />

      <List sx={{ px: 1, pb: 1 }}>
        <ListItemButton
          onClick={() => {
            handleLogout();
            closeMobileDrawer();
          }}
          sx={{ borderRadius: 2, mx: 0.5, my: 0.5 }}
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
