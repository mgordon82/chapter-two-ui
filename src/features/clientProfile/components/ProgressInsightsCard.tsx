import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import type { ProgressInsights } from '../types';

type ProgressInsightsCardProps = {
  insights: ProgressInsights;
};

const formatStatus = (status: ProgressInsights['status']) => {
  switch (status) {
    case 'on_track':
      return 'On Track';
    case 'needs_attention':
      return 'Needs Attention';
    case 'plateau':
      return 'Plateau';
    case 'improving':
      return 'Improving';
    case 'insufficient_data':
      return 'Insufficient Data';
    default:
      return '—';
  }
};

const formatGeneratedAt = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
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
  <Stack spacing={0.4} sx={{ minWidth: 0 }}>
    <Typography sx={labelSx}>{label}</Typography>
    <Typography sx={valueSx}>{value ?? '—'}</Typography>
  </Stack>
);

const ProgressInsightsCard: React.FC<ProgressInsightsCardProps> = ({
  insights
}) => {
  const highlights = insights.highlights ?? [];
  const flags = insights.flags ?? [];
  const metrics = insights.metrics ?? null;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid'
            }}
          >
            <InsightsOutlinedIcon fontSize='small' />
          </Box>
          <Typography variant='h6' fontWeight={700}>
            Progress Insights
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap='wrap'
          >
            <MetricItem label='Status' value={formatStatus(insights.status)} />
            <MetricItem
              label='Generated'
              value={formatGeneratedAt(insights.generatedAt)}
            />
            <MetricItem
              label='30-Day Weight Change'
              value={
                metrics?.weightChangeLast30Days != null
                  ? `${metrics.weightChangeLast30Days.toFixed(1)} kg`
                  : '—'
              }
            />
            <MetricItem
              label='Avg Weekly Change'
              value={
                metrics?.avgWeeklyWeightChange != null
                  ? `${metrics.avgWeeklyWeightChange.toFixed(1)} kg`
                  : '—'
              }
            />
            <MetricItem
              label='Adherence Score'
              value={
                metrics?.adherenceScore != null
                  ? `${metrics.adherenceScore}%`
                  : '—'
              }
            />
          </Stack>

          <Stack spacing={1.25}>
            {highlights.length > 0 ? (
              highlights.map((item) => (
                <Paper
                  key={`highlight-${item}`}
                  variant='outlined'
                  sx={{ p: 1.5, borderRadius: 2 }}
                >
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    lineHeight={1.7}
                  >
                    • {item}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No highlights available yet.
              </Typography>
            )}
          </Stack>

          {flags.length > 0 ? (
            <Stack spacing={1}>
              <Typography sx={labelSx}>Flags</Typography>

              {flags.map((item) => (
                <Paper
                  key={`flag-${item}`}
                  variant='outlined'
                  sx={{ p: 1.5, borderRadius: 2 }}
                >
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    lineHeight={1.7}
                  >
                    • {item}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProgressInsightsCard;
