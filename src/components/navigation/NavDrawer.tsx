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
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAppSelector } from '../../app/hooks';
import { useDispatch } from 'react-redux';
import { logoutRequested } from '../../auth/authSlice';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import {
  bottomNavItems,
  getNavSectionsForRole,
  isAppRole,
  type AppRole,
  type NavItem
} from './navConfig';

type NavDrawerProps = {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const NavDrawer: React.FC<NavDrawerProps> = ({ setMobileOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const roleRaw = currentUser?.role;
  const role: AppRole = isAppRole(roleRaw) ? roleRaw : 'client';

  const currentUserDisplayName = currentUser?.displayName?.trim() ?? '';
  const email = currentUser?.email?.trim() ?? '';
  const displayName = currentUserDisplayName || email;

  const greeting = displayName || 'Welcome';
  const navSections = getNavSectionsForRole(role);

  const closeMobileDrawer = () => setMobileOpen(false);

  const handleLogout = () => {
    dispatch(logoutRequested());
  };

  const isSelected = (path: string) => {
    return path === '/app'
      ? !!matchPath({ path: '/app', end: true }, location.pathname)
      : !!matchPath({ path, end: false }, location.pathname);
  };

  const initials = (name?: string | null) => {
    if (!name) return <PersonOutlineIcon />;
    const parts = name.trim().split(' ').filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase() || a.toUpperCase() || <PersonOutlineIcon />;
  };

  const renderNavItem = (item: NavItem) => {
    const selected = isSelected(item.path);

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

      <Box sx={{ pt: 1 }}>
        {navSections.map((section, index) => (
          <Box key={section.heading ?? `section-${index}`} sx={{ mb: 1 }}>
            {section.heading ? (
              <Typography
                variant='overline'
                sx={{
                  px: 2,
                  color: 'text.secondary',
                  letterSpacing: 0.8
                }}
              >
                {section.heading}
              </Typography>
            ) : null}

            <List sx={{ px: 1, pt: section.heading ? 0.5 : 0 }}>
              {section.items.map(renderNavItem)}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ flex: 1 }} />

      <Divider />

      <List sx={{ px: 1, py: 1 }}>
        {bottomNavItems.map(renderNavItem)}

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
