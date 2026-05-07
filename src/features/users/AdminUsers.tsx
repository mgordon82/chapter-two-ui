import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { usersListRequested, type UserListItem } from './redux/userListSlice';
import { coachOptionsRequested } from './redux/coachOptionsSlice';
import {
  assignCoachCleared,
  assignCoachRequested
} from './redux/assignCoachSlice';
import {
  manageUserRolesCleared,
  manageUserRolesRequested
} from './redux/manageUserRolesSlice';
import { getEffectiveRoles } from '../../components/navigation/miptNavConfig';
import { useLocation, useNavigate } from 'react-router-dom';

import Logo from '../../assets/Logo-white.png';

type RoleFilter = 'all' | 'admin' | 'staff' | 'coach' | 'client';
type StatusFilter = 'all' | 'active' | 'invited';
type AppRole = 'client' | 'coach' | 'admin' | 'staff';

const VALID_ROLES: AppRole[] = ['client', 'coach', 'admin', 'staff'];

const isAppRole = (value: unknown): value is AppRole => {
  return typeof value === 'string' && VALID_ROLES.includes(value as AppRole);
};

const getUserRoles = (user: UserListItem): AppRole[] => {
  if (Array.isArray(user.roles)) {
    const normalized = user.roles.filter(isAppRole);
    if (normalized.length > 0) return normalized;
  }

  if (isAppRole(user.role)) {
    return [user.role];
  }

  return [];
};

const formatDate = (value: string | null) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString();
};

const toTitleCase = (value: string | null) => {
  if (!value) return 'Unknown';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getRoleChipColor = (
  role: string | null
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
  switch (role) {
    case 'admin':
      return 'secondary';
    case 'staff':
      return 'warning';
    case 'coach':
      return 'primary';
    case 'client':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusChipColor = (
  status: string | null
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'invited':
      return 'warning';
    default:
      return 'default';
  }
};

const getInitials = (user: UserListItem) => {
  const name = user.displayName?.trim();
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    const initials = `${first}${second}`.toUpperCase();
    if (initials) return initials;
  }

  return user.email?.[0]?.toUpperCase() ?? '?';
};

const AdminUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((s) => s.usersList);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [assignCoachOpen, setAssignCoachOpen] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState('');
  const [manageRolesOpen, setManageRolesOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);

  const {
    items: coachOptions,
    isLoading: isLoadingCoaches,
    error: coachOptionsError
  } = useAppSelector((s) => s.coachOptions);

  const { isSaving: isAssigningCoach, error: assignCoachError } =
    useAppSelector((s) => s.assignCoach);

  const { isSaving: isSavingRoles, error: manageRolesError } = useAppSelector(
    (s) => s.manageUserRoles
  );

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const viewerRoles = getEffectiveRoles(currentUser);

  const isAdminLike =
    viewerRoles.includes('admin') || viewerRoles.includes('staff');
  const isCoachOnly = viewerRoles.includes('coach') && !isAdminLike;

  const handleOpenAssignCoach = () => {
    if (!selectedUser) return;

    setSelectedCoachId(selectedUser.assignedCoach?.id ?? '');
    setAssignCoachOpen(true);
    dispatch(coachOptionsRequested());
    closeMenu();
  };

  const handleCloseAssignCoach = () => {
    setAssignCoachOpen(false);
    setSelectedCoachId('');
    setSelectedUser(null);
    dispatch(assignCoachCleared());
  };

  const handleSaveAssignCoach = () => {
    if (!selectedUser) return;

    const userId = selectedUser.id;
    const coachId = selectedCoachId || null;

    setAssignCoachOpen(false);
    setSelectedCoachId('');
    setSelectedUser(null);
    dispatch(assignCoachCleared());

    dispatch(
      assignCoachRequested({
        userId,
        coachId
      })
    );
  };

  const handleOpenManageRoles = () => {
    if (!selectedUser) return;

    setSelectedRoles(getUserRoles(selectedUser));
    setManageRolesOpen(true);
    dispatch(manageUserRolesCleared());
    closeMenu();
  };

  const handleCloseManageRoles = () => {
    setManageRolesOpen(false);
    setSelectedRoles([]);
    setSelectedUser(null);
    dispatch(manageUserRolesCleared());
  };

  const handleSaveRoles = () => {
    if (!selectedUser || selectedRoles.length === 0) return;

    dispatch(
      manageUserRolesRequested({
        userId: selectedUser.id,
        roles: selectedRoles
      })
    );

    setManageRolesOpen(false);
    setSelectedRoles([]);
    setSelectedUser(null);
  };

  const openMenu = (
    event: React.MouseEvent<HTMLElement>,
    user: UserListItem
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  useEffect(() => {
    dispatch(usersListRequested());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return items.filter((user) => {
      const name = (user.displayName ?? '').toLowerCase();
      const email = user.email.toLowerCase();
      const roles = getUserRoles(user);
      const rolesText = roles.join(' ').toLowerCase();
      const status = (user.status ?? '').toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        email.includes(q) ||
        rolesText.includes(q) ||
        status.includes(q);

      const matchesRole =
        roleFilter === 'all' || roles.includes(roleFilter as AppRole);

      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [items, search, roleFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleViewProfile = (user: UserListItem | null) => {
    if (!user) return;

    const path = location.pathname;

    if (path.startsWith('/mipt/users')) {
      navigate(`/mipt/users/${user.id}`);
    } else if (path.startsWith('/crm/users')) {
      navigate(`/crm/users/${user.id}`);
    }

    closeMenu();
  };

  const filtersActive =
    search.trim() !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto', px: 2, py: 3 }}>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem onClick={() => handleViewProfile(selectedUser)}>
          View Profile
        </MenuItem>

        {isAdminLike ? (
          <MenuItem onClick={handleOpenAssignCoach}>Assign Coach</MenuItem>
        ) : null}

        {isAdminLike ? (
          <MenuItem onClick={handleOpenManageRoles}>Manage Roles</MenuItem>
        ) : null}

        {isAdminLike ? (
          <MenuItem onClick={closeMenu}>Resend Invite</MenuItem>
        ) : null}
        {isAdminLike ? (
          <MenuItem onClick={closeMenu}>Deactivate User</MenuItem>
        ) : null}
      </Menu>
      <Dialog
        open={assignCoachOpen}
        onClose={handleCloseAssignCoach}
        fullWidth
        maxWidth='xs'
      >
        <DialogTitle>Assign Coach</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              {selectedUser?.displayName || selectedUser?.email || 'User'}
            </Typography>

            <TextField
              select
              fullWidth
              size='small'
              label='Coach'
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              disabled={isLoadingCoaches}
            >
              <MenuItem value=''>Unassigned</MenuItem>

              {coachOptions.map((coach) => (
                <MenuItem key={coach.id} value={coach.id}>
                  {coach.displayName || coach.email}
                </MenuItem>
              ))}
            </TextField>
            {!isLoadingCoaches &&
            !coachOptionsError &&
            coachOptions.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                No active coaches are available yet. Invite or activate a coach
                first.
              </Typography>
            ) : null}
            {coachOptionsError ? (
              <Typography variant='body2' color='error'>
                {coachOptionsError}
              </Typography>
            ) : null}
            {assignCoachError ? (
              <Typography variant='body2' color='error'>
                {assignCoachError}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAssignCoach}>Cancel</Button>
          <Button
            onClick={handleSaveAssignCoach}
            variant='contained'
            disabled={isLoadingCoaches || isAssigningCoach}
          >
            {isAssigningCoach ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={manageRolesOpen}
        onClose={handleCloseManageRoles}
        fullWidth
        maxWidth='xs'
      >
        <DialogTitle>Manage Roles</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              {selectedUser?.displayName || selectedUser?.email || 'User'}
            </Typography>

            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Roles
              </Typography>

              <ToggleButtonGroup
                value={selectedRoles}
                onChange={(_, nextRoles: AppRole[]) => {
                  if (nextRoles.length > 0) {
                    setSelectedRoles(nextRoles);
                  }
                }}
                fullWidth
                disabled={isSavingRoles}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 1,
                  '& .MuiToggleButtonGroup-grouped': {
                    borderRadius: '8px !important',
                    border: (theme) =>
                      `1px solid ${theme.palette.divider} !important`
                  },
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    py: 1.2
                  }
                }}
              >
                <ToggleButton value='client'>Client</ToggleButton>
                <ToggleButton value='coach'>Coach</ToggleButton>
                <ToggleButton value='admin'>Admin</ToggleButton>
                <ToggleButton value='staff'>Staff</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {manageRolesError ? (
              <Typography variant='body2' color='error'>
                {manageRolesError}
              </Typography>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseManageRoles}>Cancel</Button>
          <Button
            onClick={handleSaveRoles}
            variant='contained'
            disabled={isSavingRoles || selectedRoles.length === 0}
          >
            {isSavingRoles ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant='h4' fontWeight={700}>
            {isCoachOnly ? 'My Clients' : 'User Management'}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            {isCoachOnly
              ? 'View users who are currently assigned to you.'
              : 'View and manage all users.'}
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          <TextField
            fullWidth
            size='small'
            label='Search users'
            placeholder='Search by name, email, role, or status'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            useFlexGap
          >
            <TextField
              select
              fullWidth
              size='small'
              label='Role'
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            >
              <MenuItem value='all'>All roles</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
              <MenuItem value='staff'>Staff</MenuItem>
              <MenuItem value='coach'>Coach</MenuItem>
              <MenuItem value='client'>Client</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              size='small'
              label='Status'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <MenuItem value='all'>All statuses</MenuItem>
              <MenuItem value='active'>Active</MenuItem>
              <MenuItem value='invited'>Invited</MenuItem>
              <MenuItem value='prospect'>Prospect</MenuItem>
            </TextField>
          </Stack>

          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            {!isLoading && !error ? (
              <Typography variant='body2' color='text.secondary'>
                {filteredUsers.length} of {items.length} user
                {items.length === 1 ? '' : 's'}
              </Typography>
            ) : (
              <span />
            )}

            {filtersActive && (
              <Button size='small' onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </Stack>
        </Stack>

        {isLoading ? (
          <Stack alignItems='center' py={6}>
            <CircularProgress />
          </Stack>
        ) : error ? (
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography color='error'>{error}</Typography>
          </Paper>
        ) : filteredUsers.length === 0 ? (
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography fontWeight={600}>No users found</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              Try adjusting your search or filters.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))'
              },
              gap: 2
            }}
          >
            {filteredUsers.map((user: UserListItem) => {
              const userRoles = getUserRoles(user);

              return (
                <Paper
                  key={user.id}
                  variant='outlined'
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 160ms ease, box-shadow 160ms ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Stack spacing={1.75}>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='flex-start'
                      spacing={1.5}
                    >
                      <Stack
                        direction='row'
                        spacing={1.25}
                        alignItems='flex-start'
                        sx={{ minWidth: 0, flex: 1 }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            bgcolor: 'action.selected',
                            color: 'text.primary'
                          }}
                        >
                          {getInitials(user)}
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack alignItems='center' direction='row' gap={1}>
                            <Typography
                              fontWeight={700}
                              sx={{
                                lineHeight: 1.2,
                                pr: 1
                              }}
                            >
                              {user.displayName ?? 'No name yet'}
                            </Typography>

                            {user.miptAccess?.status !== 'none' && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 18,
                                  height: 18,
                                  borderRadius: '4px',
                                  backgroundColor:
                                    user.miptAccess?.status === 'invited'
                                      ? '#fff'
                                      : 'transparent'
                                }}
                              >
                                <Box
                                  component='img'
                                  src={Logo}
                                  alt='MiPT'
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    objectFit: 'contain',
                                    filter:
                                      user.miptAccess?.status === 'invited'
                                        ? 'invert(1)'
                                        : 'none'
                                  }}
                                />
                              </Box>
                            )}
                          </Stack>

                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{
                              mt: 0.4,
                              wordBreak: 'break-word'
                            }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>

                      <IconButton
                        size='small'
                        onClick={(e) => openMenu(e, user)}
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          color: 'text.secondary',
                          flexShrink: 0,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.default',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <MoreVertIcon fontSize='small' />
                      </IconButton>
                    </Stack>

                    <Stack
                      direction='row'
                      spacing={1}
                      flexWrap='wrap'
                      useFlexGap
                    >
                      {userRoles.length > 0 ? (
                        userRoles.map((role) => (
                          <Chip
                            key={`${user.id}-${role}`}
                            size='small'
                            label={toTitleCase(role)}
                            color={getRoleChipColor(role)}
                            variant='outlined'
                          />
                        ))
                      ) : (
                        <Chip
                          size='small'
                          label='Unknown'
                          color='default'
                          variant='outlined'
                        />
                      )}

                      <Chip
                        size='small'
                        label={toTitleCase(user.status)}
                        color={getStatusChipColor(user.status)}
                        variant='outlined'
                      />
                    </Stack>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Coach:{' '}
                        {user.assignedCoach
                          ? user.assignedCoach.displayName ||
                            user.assignedCoach.email
                          : 'Unassigned'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        pt: 1.25,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 0.5, sm: 2 }}
                        useFlexGap
                      >
                        <Typography variant='caption' color='text.secondary'>
                          Created: {formatDate(user.createdAt)}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Updated: {formatDate(user.updatedAt)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default AdminUsersPage;
