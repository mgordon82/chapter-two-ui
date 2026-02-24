import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAppSelector } from '../../app/hooks';
import { useDispatch } from 'react-redux';
import { logoutRequested } from '../../auth/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';

type NavDrawerProps = {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const NavDrawer: React.FC<NavDrawerProps> = ({ setMobileOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const role = currentUser?.role;
  const canInvite = role === 'admin' || role === 'staff' || role === 'coach';

  const currentUserDisplayName = currentUser?.displayName?.trim() ?? '';
  const email = currentUser?.email?.trim() ?? '';
  const displayName = currentUserDisplayName || email;

  const greeting = displayName || 'Welcome';

  const closeMobileDrawer = () => setMobileOpen(false);

  const handleLogout = () => {
    dispatch(logoutRequested());
  };

  const navItems = [
    {
      label: 'Meal Generator',
      path: '/app/meal-generator',
      icon: <RestaurantMenuIcon />
    },
    ...(canInvite
      ? [
          {
            label: 'Invite User',
            path: '/app/users/invite',
            icon: <PersonAddIcon />
          }
        ]
      : [])
  ];

  const initials = (name?: string | null) => {
    if (!name) return <PersonOutlineIcon />;
    const parts = name.trim().split(' ').filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase() || a.toUpperCase() || <PersonOutlineIcon />;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Stack direction='row' alignItems='center'>
          <Button
            onClick={() => {
              navigate('/app/nutrition-profile');
              closeMobileDrawer();
            }}
          >
            <Avatar sx={{ width: 40, height: 40 }}>
              {initials(displayName)}
            </Avatar>
          </Button>

          <Box sx={{ minWidth: 0 }}>
            <Button
              variant='text'
              onClick={() => {
                navigate('/app/nutrition-profile');
                closeMobileDrawer();
              }}
            >
              <Typography fontSize='0.75rem' fontWeight={700} noWrap>
                {greeting}
              </Typography>
            </Button>
          </Box>
        </Stack>
      </Box>

      <Divider />

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
};

export default NavDrawer;
