import React from 'react';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';

type ClientProfileHeaderProps = {
  displayName: string;
  email: string | null;
  roles: string[];
  status: string;
  assignedCoach: string | null;
  createdAt: string | null;
  lastCheckInAt: string | null;
  weightToGoalKg: number | null;
  onEditProfile?: () => void;
  onMessage?: () => void;
  onDeactivate?: () => void;
};

const labelSx = {
  fontSize: '0.78rem',
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: 0.6
};

const valueSx = {
  fontSize: '0.98rem',
  fontWeight: 600,
  color: 'text.primary'
};

const getInitials = (name: string) => {
  const parts = name.split(' ').filter(Boolean);
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString();
};

const formatGoalProgress = (weightToGoalKg: number | null) => {
  if (weightToGoalKg == null) return '—';

  if (Math.abs(weightToGoalKg) < 0.05) return 'At goal';

  if (weightToGoalKg > 0) {
    return `${weightToGoalKg.toFixed(1)} kg to goal`;
  }

  return `${Math.abs(weightToGoalKg).toFixed(1)} kg below goal`;
};

const toTitleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const MetricItem: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <Stack spacing={0.4}>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value}</Typography>
  </Stack>
);

const ClientProfileHeader: React.FC<ClientProfileHeaderProps> = ({
  displayName,
  email,
  roles,
  status,
  assignedCoach,
  createdAt,
  lastCheckInAt,
  weightToGoalKg,
  onEditProfile,
  onMessage,
  onDeactivate
}) => {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar sx={{ width: 64, height: 64, fontWeight: 700 }}>
                {getInitials(displayName)}
              </Avatar>

              <Stack spacing={0.75}>
                <Typography
                  variant='h4'
                  fontWeight={800}
                  sx={{ lineHeight: 1.1 }}
                >
                  {displayName}
                </Typography>

                <Typography color='text.secondary'>{email ?? '—'}</Typography>

                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                  {roles.map((role) => (
                    <Chip
                      key={role}
                      label={toTitleCase(role)}
                      size='small'
                      variant='outlined'
                    />
                  ))}

                  <Chip
                    label={toTitleCase(status)}
                    size='small'
                    color={status === 'active' ? 'success' : 'default'}
                    variant='outlined'
                  />
                </Stack>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              width={{ xs: '100%', md: 'auto' }}
            >
              <Button
                startIcon={<EditOutlinedIcon />}
                variant='outlined'
                onClick={onEditProfile}
                disabled={!onEditProfile}
              >
                Edit Profile
              </Button>

              <Button
                startIcon={<EmailOutlinedIcon />}
                variant='outlined'
                onClick={onMessage}
                disabled={!onMessage}
              >
                Message
              </Button>

              <Button
                startIcon={<PersonOffOutlinedIcon />}
                variant='outlined'
                onClick={onDeactivate}
                disabled={!onDeactivate}
              >
                Deactivate
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 3 }}
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem
              label='Assigned Coach'
              value={assignedCoach || 'Unassigned'}
            />
            <MetricItem label='Created' value={formatDate(createdAt)} />
            <MetricItem
              label='Last Check-In'
              value={formatDate(lastCheckInAt)}
            />
            <MetricItem
              label='Goal Progress'
              value={formatGoalProgress(weightToGoalKg)}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ClientProfileHeader;
