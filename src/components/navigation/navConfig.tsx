import React from 'react';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';

export type AppRole = 'client' | 'coach' | 'admin' | 'staff';

export type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
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

export const getValidRoles = (roles: unknown): AppRole[] => {
  if (!Array.isArray(roles)) return [];
  return roles.filter(isAppRole);
};

export const expandRoles = (roles: AppRole[]): AppRole[] => {
  const expanded = new Set<AppRole>(roles);

  if (expanded.has('admin')) {
    expanded.add('coach');
    expanded.add('client');
  }

  if (expanded.has('coach')) {
    expanded.add('client');
  }

  return Array.from(expanded);
};

export const getEffectiveRoles = (
  currentUser: { role?: unknown; roles?: unknown } | null | undefined
): AppRole[] => {
  if (!currentUser) return [];

  const directRoles = getValidRoles(currentUser.roles);

  if (directRoles.length > 0) {
    return expandRoles(directRoles);
  }

  if (isAppRole(currentUser.role)) {
    return expandRoles([currentUser.role]);
  }

  return [];
};

const mainSection: NavSection = {
  items: [
    {
      label: 'Dashboard',
      path: '/app',
      icon: <DashboardIcon />,
      exact: true
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
          label: 'My Clients',
          path: '/app/users',
          icon: <PeopleIcon />,
          exact: true
        },
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
          label: 'All Users',
          path: '/app/users',
          icon: <PeopleIcon />,
          exact: true
        },
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

export const getNavSectionsForRole = (role: AppRole): NavSection[] => {
  return [mainSection, ...roleSectionsByRole[role]];
};

export const getNavSectionsForRoles = (roles: AppRole[]): NavSection[] => {
  const normalizedRoles = expandRoles(getValidRoles(roles));

  if (normalizedRoles.length === 0) {
    return [mainSection];
  }

  const sectionMap = new Map<string, NavItem[]>();
  const seenPaths = new Set<string>();

  for (const role of normalizedRoles) {
    for (const section of roleSectionsByRole[role]) {
      const key = section.heading ?? '__main__';
      const existingItems = sectionMap.get(key) ?? [];

      for (const item of section.items) {
        if (seenPaths.has(item.path)) {
          continue;
        }

        existingItems.push(item);
        seenPaths.add(item.path);
      }

      if (existingItems.length > 0) {
        sectionMap.set(key, existingItems);
      }
    }
  }

  const combinedSections: NavSection[] = [];

  for (const [key, items] of sectionMap.entries()) {
    combinedSections.push({
      heading: key === '__main__' ? undefined : key,
      items
    });
  }

  return [mainSection, ...combinedSections];
};

export const bottomNavItems: NavItem[] = [
  {
    label: 'Profile',
    path: '/app/nutrition-profile',
    icon: <PersonOutlineIcon />
  }
];
