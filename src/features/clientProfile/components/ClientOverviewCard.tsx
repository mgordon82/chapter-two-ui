import React from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import type { ClientOverview } from '../types';

type ClientOverviewCardProps = {
  overview: ClientOverview;
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

const MetricItem: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <Stack spacing={0.4}>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value ?? '—'}</Typography>
  </Stack>
);

const formatGoalType = (value?: ClientOverview['goalType']) => {
  switch (value) {
    case 'fat_loss':
      return 'Fat Loss';
    case 'maintenance':
      return 'Maintenance';
    case 'muscle_gain':
      return 'Muscle Gain';
    case 'recomp':
      return 'Recomp';
    default:
      return '—';
  }
};

const formatStatus = (value: ClientOverview['status']) => {
  switch (value) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'pending':
      return 'Pending';
    default:
      return value;
  }
};

const ClientOverviewCard: React.FC<ClientOverviewCardProps> = ({
  overview
}) => {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 2 }}>
          <FlagOutlinedIcon fontSize='small' />
          <Typography variant='h6' fontWeight={700}>
            Client Overview
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <MetricItem label='Age' value={overview.age ?? '—'} />
          <MetricItem label='Height' value={overview.heightDisplay || '—'} />
          <MetricItem
            label='Current Weight'
            value={overview.currentWeightDisplay || '—'}
          />
          <MetricItem
            label='Goal Weight'
            value={overview.goalWeightDisplay || '—'}
          />
          <MetricItem label='Goal' value={formatGoalType(overview.goalType)} />
          <MetricItem
            label='Membership Service'
            value={overview.membershipService || '—'}
          />
          <MetricItem label='Status' value={formatStatus(overview.status)} />
          <MetricItem
            label='Assigned Coach'
            value={overview.assignedCoach?.fullName || '—'}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ClientOverviewCard;
