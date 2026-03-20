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
import type { CheckInTooltipProps, UnitPrefType } from '../types';
import {
  formatDateLabel,
  formatDateTimeLabel,
  toDisplayWeight
} from '../helpers';
import type { MappedCheckIn } from '../redux/checkInsSlice';
import CheckInPhotosDialog from './CheckInPhotosDialog';

type ChartTypes = {
  filteredItems: MappedCheckIn[];
  weightUnitPref: UnitPrefType;
};

type ChartPoint = {
  id: string;
  xValue: string;
  recordedAt: string;
  weight: number;
  hasPhotos: boolean;
  sourceCheckIn: MappedCheckIn;
  sourceLabel: string | null;
};

type DotPayload = {
  cx?: number;
  cy?: number;
  payload?: ChartPoint;
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

function getCheckInSourceLabel(ci: MappedCheckIn): string | null {
  if (!ci.raw || typeof ci.raw !== 'object') return null;

  const raw = ci.raw as {
    source?: {
      appSourceName?: string | null;
      type?: string | null;
    };
  };

  if (raw.source?.appSourceName) return raw.source.appSourceName;
  if (raw.source?.type === 'apple_health') return 'Apple Health';

  return null;
}

const CheckInTooltip = ({ active, payload, unit }: CheckInTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const firstEntry = payload[0] as
    | {
        value?: unknown;
        payload?: ChartPoint;
      }
    | undefined;

  const point = firstEntry?.payload;
  const raw = firstEntry?.value;

  const n =
    typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;

  const dateLabel = point ? formatDateTimeLabel(point.recordedAt) : '';

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

      {point?.sourceLabel ? (
        <Typography
          variant='caption'
          sx={{
            display: 'block',
            color: 'rgba(255,255,255,0.75)',
            mt: 0.5,
            fontWeight: 700
          }}
        >
          Source: {point.sourceLabel}
        </Typography>
      ) : null}

      {point?.hasPhotos ? (
        <Typography
          variant='caption'
          sx={{
            display: 'block',
            color: 'primary.main',
            mt: 0.5,
            fontWeight: 700
          }}
        >
          Photos attached
        </Typography>
      ) : null}
    </Box>
  );
};

const CheckInsChart = ({ filteredItems, weightUnitPref }: ChartTypes) => {
  const loadedProfile = useAppSelector(selectLoadedUserProfile);
  const [selectedCheckIn, setSelectedCheckIn] = useState<MappedCheckIn | null>(
    null
  );

  const chartData = useMemo<ChartPoint[]>(() => {
    return filteredItems
      .filter(
        (ci): ci is MappedCheckIn & { recordedAt: string; weightKg: number } =>
          ci.recordedAt != null && ci.weightKg != null
      )
      .map((ci) => ({
        id: ci.id,
        xValue: `${ci.recordedAt}__${ci.id}`,
        recordedAt: ci.recordedAt,
        weight: toDisplayWeight(ci.weightKg, weightUnitPref),
        hasPhotos: Boolean(ci.hasPhotos && ci.photos?.length),
        sourceCheckIn: ci,
        sourceLabel: getCheckInSourceLabel(ci)
      }));
  }, [filteredItems, weightUnitPref]);

  const filteredChartData = useMemo(() => {
    return chartData;
  }, [chartData]);

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

  const renderDot = ({ cx, cy, payload }: DotPayload) => {
    if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) {
      return null;
    }

    const clickable = payload.hasPhotos;

    return (
      <g
        onClick={
          clickable
            ? (e) => {
                e.stopPropagation();
                setSelectedCheckIn(payload.sourceCheckIn);
              }
            : undefined
        }
        style={{
          cursor: clickable ? 'pointer' : 'default',
          pointerEvents: 'all'
        }}
      >
        {clickable ? (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={14}
              fill='transparent'
              stroke='transparent'
            />
            <circle
              cx={cx}
              cy={cy}
              r={7}
              fill='rgba(42, 201, 184, 0.18)'
              stroke='rgba(42, 201, 184, 0.85)'
              strokeWidth={1.5}
            />
            <circle cx={cx} cy={cy} r={3} fill='rgba(42, 201, 184, 1)' />
          </>
        ) : (
          <>
            <circle
              cx={cx}
              cy={cy}
              r={10}
              fill='transparent'
              stroke='transparent'
            />
            <circle cx={cx} cy={cy} r={3} fill='currentColor' />
          </>
        )}
      </g>
    );
  };

  return (
    <>
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
                dataKey='xValue'
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) =>
                  formatDateLabel(
                    String(filteredChartData[index]?.recordedAt ?? value)
                  )
                }
                minTickGap={40}
              />
              <YAxis tick={{ fontSize: 12 }} width={52} domain={yDomain} />
              <Tooltip
                content={<CheckInTooltip unit={weightUnitPref} />}
                cursor={{ strokeDasharray: '4 4' }}
                labelFormatter={(value) =>
                  formatDateTimeLabel(String(value).split('__')[0])
                }
              />

              {goalWeightDisplay != null ? (
                <ReferenceLine y={goalWeightDisplay} strokeDasharray='4 4' />
              ) : null}

              <Line
                type='monotone'
                dataKey='weight'
                strokeWidth={2}
                dot={renderDot}
                activeDot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </Box>

      <CheckInPhotosDialog
        open={Boolean(selectedCheckIn)}
        onClose={() => setSelectedCheckIn(null)}
        checkIn={selectedCheckIn}
      />
    </>
  );
};

export default CheckInsChart;
