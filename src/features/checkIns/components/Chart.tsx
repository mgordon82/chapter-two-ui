import { Box, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useAppSelector } from '../../../app/hooks';
import { selectLoadedUserProfile } from '../../nutritionCalculator/redux/nutritionCalculatorSlice';
import type { CheckInTooltipProps, RangeKey, UnitPrefType } from '../types';
import {
  formatDateLabel,
  formatDateTimeLabel,
  startDateForRange,
  toDisplayWeight
} from '../helpers';
import type { CheckIn } from '../redux/checkInsSlice';

type ChartTypes = {
  filteredItems: CheckIn[];
  weightUnitPref: UnitPrefType;
  range: RangeKey;
};

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ width: cr.width, height: cr.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

const CheckInTooltip = ({
  active,
  label,
  payload,
  unit
}: CheckInTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const raw = payload[0]?.value;
  const n =
    typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;

  const dateLabel = typeof label === 'string' ? formatDateTimeLabel(label) : '';

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
        {dateLabel}
      </Typography>

      <Typography variant='h6' sx={{ lineHeight: 1.1 }}>
        {Number.isFinite(n) ? `${n} ${unit}` : `-- ${unit}`}
      </Typography>

      <Typography
        variant='caption'
        sx={{ display: 'block', color: 'rgba(255,255,255,0.6)', mt: 0.25 }}
      >
        Weight
      </Typography>
    </Box>
  );
};

const CheckInsChart = ({
  filteredItems,
  weightUnitPref,
  range
}: ChartTypes) => {
  const loadedProfile = useAppSelector(selectLoadedUserProfile);

  const chartData = useMemo(() => {
    const chronological = [...filteredItems].reverse();

    return chronological.map((ci) => ({
      id: ci._id,
      recordedAt: ci.recordedAt,
      weight: toDisplayWeight(ci.metrics.weightKg, weightUnitPref)
    }));
  }, [filteredItems, weightUnitPref]);

  const filteredChartData = useMemo(() => {
    if (chartData.length === 0) return chartData;

    const end = new Date(chartData[chartData.length - 1].recordedAt);
    const start = startDateForRange(range, end).getTime();

    return chartData.filter((d) => new Date(d.recordedAt).getTime() >= start);
  }, [chartData, range]);

  const goalWeightDisplay = useMemo(() => {
    const kg = loadedProfile?.profile?.goalWeightKg ?? null;
    if (kg == null) return null;
    if (!Number.isFinite(kg)) return null;
    return toDisplayWeight(kg, weightUnitPref);
  }, [loadedProfile, weightUnitPref]);

  const yDomain = useMemo(() => {
    if (filteredChartData.length === 0) return ['auto', 'auto'] as const;

    const values = filteredChartData.map((d) => d.weight);
    if (goalWeightDisplay != null) values.push(goalWeightDisplay);

    const min = Math.min(...values);
    const max = Math.max(...values);

    const padding = (max - min) * 0.2 || 1;

    return [Math.floor(min - padding), Math.ceil(max + padding)] as const;
  }, [filteredChartData, goalWeightDisplay]);
  const { ref, size } = useElementSize<HTMLDivElement>();

  return (
    <Box
      ref={ref}
      sx={{ width: '100%', height: 200, minWidth: 0, minHeight: 0 }}
    >
      {size.width > 0 && size.height > 0 ? (
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={filteredChartData}
            margin={{ top: 12, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey='recordedAt'
              tick={{ fontSize: 12 }}
              tickFormatter={(iso) => formatDateLabel(String(iso))}
              minTickGap={20}
            />
            <YAxis tick={{ fontSize: 12 }} width={52} domain={yDomain} />
            <Tooltip
              content={<CheckInTooltip unit={weightUnitPref} />}
              cursor={{ strokeDasharray: '4 4' }}
              labelFormatter={(iso) => formatDateTimeLabel(String(iso))}
            />

            {goalWeightDisplay != null ? (
              <ReferenceLine y={goalWeightDisplay} strokeDasharray='4 4' />
            ) : null}

            <Line
              type='monotone'
              dataKey='weight'
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </Box>
  );
};

export default CheckInsChart;
