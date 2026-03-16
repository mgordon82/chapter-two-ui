import React, { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { WeightTrend } from '../types';

type RangeKey = '1M' | '3M' | '6M' | '12M';

type WeightTrendCardProps = {
  weightTrend: WeightTrend;
  goalWeightKg?: number | null;
  selectedRange?: RangeKey;
};

type ChartPoint = {
  id: string;
  recordedAt: string;
  xValue: string;
  weight: number;
  trendWeight: number;
};

const formatDateLabel = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTimeLabel = (value: string) => {
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

const startDateForRange = (range: RangeKey, end: Date) => {
  const d = new Date(end);

  switch (range) {
    case '1M':
      d.setMonth(d.getMonth() - 1);
      return d;
    case '3M':
      d.setMonth(d.getMonth() - 3);
      return d;
    case '6M':
      d.setMonth(d.getMonth() - 6);
      return d;
    case '12M':
      d.setFullYear(d.getFullYear() - 1);
      return d;
    default:
      return d;
  }
};

const WeightTrendTooltip = ({
  active,
  payload,
  unit
}: {
  active?: boolean;
  payload?: Array<{ value?: unknown; payload?: ChartPoint }>;
  unit: 'kg' | 'lb';
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const weightEntry = payload.find((entry) => entry?.payload);
  const point = weightEntry?.payload;

  const rawWeightEntry = payload.find(
    (entry) => entry?.payload && typeof entry.value !== 'undefined'
  );
  const raw = rawWeightEntry?.value;

  const n =
    typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 1.5,
        backgroundColor: 'rgba(0,0,0,0.75)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        minWidth: 160
      }}
    >
      <Typography
        variant='caption'
        sx={{ display: 'block', color: 'rgba(255,255,255,0.7)', mb: 0.25 }}
      >
        {point ? formatDateTimeLabel(point.recordedAt) : ''}
      </Typography>

      <Typography variant='h6' sx={{ lineHeight: 1.1 }}>
        {Number.isFinite(n) ? `${n.toFixed(1)} ${unit}` : `-- ${unit}`}
      </Typography>

      <Typography
        variant='caption'
        sx={{ display: 'block', color: 'rgba(255,255,255,0.6)', mt: 0.25 }}
      >
        Daily weight
      </Typography>

      {point ? (
        <Typography
          variant='caption'
          sx={{ display: 'block', color: 'rgba(255,255,255,0.6)', mt: 0.5 }}
        >
          Trend: {point.trendWeight.toFixed(1)} {unit}
        </Typography>
      ) : null}
    </Box>
  );
};

const WeightTrendCard: React.FC<WeightTrendCardProps> = ({
  weightTrend,
  goalWeightKg = null,
  selectedRange = '3M'
}) => {
  const [range, setRange] = useState<RangeKey>(selectedRange);

  const dailyPoints = useMemo(() => {
    const sorted = [...(weightTrend.points ?? [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const byDay = new Map<string, (typeof sorted)[number]>();

    for (const point of sorted) {
      const dayKey = point.date.slice(0, 10);
      const existing = byDay.get(dayKey);

      if (!existing || new Date(point.date) > new Date(existing.date)) {
        byDay.set(dayKey, point);
      }
    }

    return [...byDay.values()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [weightTrend.points]);

  const filteredDailyPoints = useMemo(() => {
    if (dailyPoints.length === 0) return [];

    const latestDate = new Date(dailyPoints[dailyPoints.length - 1].date);
    const start = startDateForRange(range, latestDate);

    return dailyPoints.filter((point) => {
      const recordedAt = new Date(point.date);
      return recordedAt >= start && recordedAt <= latestDate;
    });
  }, [dailyPoints, range]);

  const chartData = useMemo<ChartPoint[]>(() => {
    return filteredDailyPoints.map((point, index, arr) => {
      const windowStart = Math.max(0, index - 6);
      const window = arr.slice(windowStart, index + 1);
      const avg =
        window.reduce((sum, item) => sum + item.weight, 0) / window.length;

      return {
        id: `${point.date}-${index}`,
        recordedAt: point.date,
        xValue: `${point.date}__${index}`,
        weight: Number(point.weight.toFixed(2)),
        trendWeight: Number(avg.toFixed(2))
      };
    });
  }, [filteredDailyPoints]);

  const latest = chartData[chartData.length - 1] ?? null;
  const first = chartData[0] ?? null;

  const change =
    first && latest ? Number((latest.weight - first.weight).toFixed(1)) : null;

  const isDown = change != null && change < 0;

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'] as const;

    const values = chartData.flatMap((d) => [d.weight, d.trendWeight]);

    if (goalWeightKg != null) {
      values.push(goalWeightKg);
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.2 || 1;

    return [Math.floor(min - padding), Math.ceil(max + padding)] as const;
  }, [chartData, goalWeightKg]);

  if (chartData.length === 0) {
    return (
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant='h6' fontWeight={700}>
            Weight Trend
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            No weight data available yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={1.5}
          >
            <Stack direction='row' spacing={1} alignItems='center'>
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
                <TrendingUpOutlinedIcon fontSize='small' />
              </Box>
              <Box>
                <Typography variant='h6' fontWeight={700}>
                  Weight Trend
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {change == null
                    ? 'No change data yet'
                    : `${isDown ? 'Down' : 'Up'} ${Math.abs(change).toFixed(
                        1
                      )} ${weightTrend.unit} over ${range}`}
                </Typography>
              </Box>
            </Stack>

            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {(['1M', '3M', '6M', '12M'] as const).map((rangeLabel) => (
                <Chip
                  key={rangeLabel}
                  label={rangeLabel}
                  size='small'
                  clickable
                  onClick={() => setRange(rangeLabel)}
                  color={rangeLabel === range ? 'primary' : 'default'}
                  variant={rangeLabel === range ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Stack>

          <Box sx={{ width: '100%', height: 240, minWidth: 0 }}>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey='xValue'
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    formatDateLabel(String(value).split('__')[0])
                  }
                  minTickGap={40}
                />

                <YAxis tick={{ fontSize: 12 }} width={52} domain={yDomain} />

                <Tooltip
                  content={<WeightTrendTooltip unit={weightTrend.unit} />}
                  cursor={{ strokeDasharray: '4 4' }}
                />

                {goalWeightKg != null ? (
                  <ReferenceLine
                    y={goalWeightKg}
                    strokeDasharray='4 4'
                    stroke='rgba(255,255,255,0.35)'
                  />
                ) : null}

                <Line
                  type='monotone'
                  dataKey='weight'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

                <Line
                  type='monotone'
                  dataKey='trendWeight'
                  strokeWidth={3}
                  dot={false}
                  activeDot={false}
                  stroke='rgba(255,255,255,0.75)'
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <Stack
            direction='row'
            justifyContent='space-between'
            sx={{ px: 0.5 }}
          >
            <Typography variant='caption' color='text.secondary'>
              {first ? formatDateLabel(first.recordedAt) : '—'}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {latest ? formatDateLabel(latest.recordedAt) : '—'}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WeightTrendCard;
