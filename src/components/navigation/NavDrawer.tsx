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
import * as miptNav from './miptNavConfig';
import * as crmNav from './crmNavConfig';
import type { AppRole, NavItem } from './miptNavConfig';
import { selectLoadedUserProfile } from '../../features/nutritionCalculator/redux/nutritionCalculatorSlice';

type NavDrawerProps = {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const NavDrawer: React.FC<NavDrawerProps> = ({ setMobileOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isCrm = location.pathname.startsWith('/crm');

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const loadedProfile = useAppSelector(selectLoadedUserProfile);

  const navConfig = isCrm ? crmNav : miptNav;

  const navRoles: AppRole[] = navConfig.getEffectiveRoles(currentUser);

  const navSections = navConfig.getNavSectionsForRoles(
    navRoles.length > 0 ? navRoles : ['client']
  );

  const bottomNavItems = navConfig.bottomNavItems;

  const profileFirstName = loadedProfile?.profile.firstName?.trim() ?? '';
  const profileLastName = loadedProfile?.profile.lastName?.trim() ?? '';
  const profileDisplayName = [profileFirstName, profileLastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const currentUserDisplayName = currentUser?.displayName?.trim() ?? '';
  const email = currentUser?.email?.trim() ?? '';

  const displayName = profileDisplayName || currentUserDisplayName || email;
  const greeting = displayName || 'Welcome';

  const closeMobileDrawer = () => setMobileOpen(false);

  const handleLogout = () => {
    dispatch(logoutRequested());
  };

  const isSelected = (item: NavItem) => {
    return !!matchPath(
      { path: item.path, end: item.exact ?? false },
      location.pathname
    );
  };

  const initials = (name?: string | null) => {
    if (!name) return <PersonOutlineIcon />;
    const parts = name.trim().split(' ').filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase() || a.toUpperCase() || <PersonOutlineIcon />;
  };

  const renderNavItem = (item: NavItem) => {
    const selected = isSelected(item);

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
          {isCrm ? (
            <>
              <Avatar sx={{ width: 40, height: 40 }}>
                {initials(displayName)}
              </Avatar>

              <Box sx={{ minWidth: 0, ml: 1 }}>
                <Typography fontSize='0.75rem' fontWeight={700} noWrap>
                  {greeting}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  navigate('/mipt/my-profile');
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
                    navigate('/mipt/my-profile');
                    closeMobileDrawer();
                  }}
                >
                  <Typography fontSize='0.75rem' fontWeight={700} noWrap>
                    {greeting}
                  </Typography>
                </Button>
              </Box>
            </>
          )}
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
