import React from 'react';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';

export type AppRole = 'client' | 'coach' | 'admin' | 'staff';

export type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

export type NavSection = {
  heading?: string;
  items: NavItem[];
};

export const isAppRole = (value: unknown): value is AppRole => {
  return (
    value === 'client' ||
    value === 'coach' ||
    value === 'admin' ||
    value === 'staff'
  );
};

export const getNavSectionsForRole = (role: AppRole): NavSection[] => {
  const mainSection: NavSection = {
    items: [
      {
        label: 'Dashboard',
        path: '/app',
        icon: <DashboardIcon />
      },
      {
        label: 'Meal Generator',
        path: '/app/meal-generator',
        icon: <RestaurantMenuIcon />
      }
    ]
  };

  const roleSectionsByRole: Record<AppRole, NavSection[]> = {
    client: [],
    coach: [
      {
        heading: 'Coach Tools',
        items: [
          {
            label: 'Invite User',
            path: '/app/users/invite',
            icon: <PersonAddIcon />
          }
        ]
      }
    ],
    admin: [
      {
        heading: 'Admin Tools',
        items: [
          {
            label: 'Invite User',
            path: '/app/users/invite',
            icon: <PersonAddIcon />
          }
        ]
      }
    ],
    staff: [
      {
        heading: 'Admin Tools',
        items: [
          {
            label: 'Invite User',
            path: '/app/users/invite',
            icon: <PersonAddIcon />
          }
        ]
      }
    ]
  };

  return [mainSection, ...roleSectionsByRole[role]];
};

export const bottomNavItems: NavItem[] = [
  {
    label: 'Profile',
    path: '/app/nutrition-profile',
    icon: <PersonOutlineIcon />
  }
];
