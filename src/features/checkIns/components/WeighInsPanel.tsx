import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

import InsightsIcon from '@mui/icons-material/Insights';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  fetchCheckInsRequested,
  type MappedCheckIn
} from '../redux/checkInsSlice';
import { selectUserUnitPrefs } from '../../nutritionCalculator/redux/nutritionCalculatorSlice';

import type { RangeKey, ViewMode } from '../types';
import CheckInsChart from './Chart';
import CheckInList from './CheckInList';
import { formatWeight, startDateForRange } from '../helpers';
import { trendMetricsRequested } from '../../trend/redux/trendSlice';

const rangeRank: Record<RangeKey, number> = {
  '1W': 1,
  '1M': 2,
  '3M': 3,
  '6M': 4,
  '12M': 5
};

type WeighInsTypes = {
  handleOpenNewCheckIn?: (item?: MappedCheckIn | null) => void;
};

const parseRepresentedDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const doesLoadedRangeCoverRequestedRange = (
  loaded: RangeKey | null,
  requested: RangeKey
) => {
  if (!loaded) return false;
  return rangeRank[loaded] >= rangeRank[requested];
};

const WeighInsPanel = ({ handleOpenNewCheckIn }: WeighInsTypes) => {
  const dispatch = useAppDispatch();
  const { items, loading, error, loadedRange } = useAppSelector(
    (s) => s.checkIns
  );

  const unitPrefs = useAppSelector(selectUserUnitPrefs);
  const trend = useAppSelector((s) => s.trend);
  const healthKit = useAppSelector((s) => s.healthKit);

  const weightUnitPref = unitPrefs?.weightUnitPref === 'lbs' ? 'lbs' : 'kg';

  const avgChangePerWeekKg =
    trend.metrics.data?.metrics.avgChangePerWeekKg ?? null;

  const trendDirectionLabel =
    avgChangePerWeekKg == null
      ? null
      : avgChangePerWeekKg < -0.05
      ? `Losing ~${formatWeight(
          Math.abs(avgChangePerWeekKg),
          weightUnitPref
        )} ${weightUnitPref}/week`
      : avgChangePerWeekKg > 0.05
      ? `Gaining ~${formatWeight(
          Math.abs(avgChangePerWeekKg),
          weightUnitPref
        )} ${weightUnitPref}/week`
      : 'Holding steady';

  const last7n = trend.metrics.data?.windows?.last7?.n ?? null;
  const prev7n = trend.metrics.data?.windows?.prev7?.n ?? null;

  const avgWeighInsPerWeek =
    last7n != null && prev7n != null ? (last7n + prev7n) / 2 : null;

  const consistencyTone =
    avgWeighInsPerWeek == null
      ? 'text.secondary'
      : avgWeighInsPerWeek >= 4
      ? 'success.main'
      : avgWeighInsPerWeek >= 2
      ? 'warning.main'
      : 'text.secondary';

  const appleHealthStatusText = healthKit.syncing
    ? 'Apple Health syncing…'
    : healthKit.error
    ? 'Apple Health sync failed'
    : healthKit.lastSummary
    ? (() => {
        const weightParts: string[] = [];
        const stepsParts: string[] = [];

        if (healthKit.lastSummary.weight.createdCount > 0) {
          weightParts.push(`${healthKit.lastSummary.weight.createdCount} new`);
        }
        if (healthKit.lastSummary.weight.duplicateCount > 0) {
          weightParts.push(
            `${healthKit.lastSummary.weight.duplicateCount} duplicates`
          );
        }
        if (healthKit.lastSummary.weight.conflictCount > 0) {
          weightParts.push(
            `${healthKit.lastSummary.weight.conflictCount} conflicts`
          );
        }
        if (
          weightParts.length === 0 &&
          healthKit.lastSummary.weight.total > 0
        ) {
          weightParts.push(`${healthKit.lastSummary.weight.total} checked`);
        }

        if (healthKit.lastSummary.steps.createdCount > 0) {
          stepsParts.push(`${healthKit.lastSummary.steps.createdCount} new`);
        }
        if (healthKit.lastSummary.steps.updatedCount > 0) {
          stepsParts.push(
            `${healthKit.lastSummary.steps.updatedCount} updated`
          );
        }
        if (stepsParts.length === 0 && healthKit.lastSummary.steps.total > 0) {
          stepsParts.push(`${healthKit.lastSummary.steps.total} checked`);
        }

        const summaryParts: string[] = [];

        if (healthKit.lastSummary.weight.total > 0) {
          summaryParts.push(`Weight: ${weightParts.join(', ')}`);
        }

        if (healthKit.lastSummary.steps.total > 0) {
          summaryParts.push(`Steps: ${stepsParts.join(', ')}`);
        }

        return summaryParts.length > 0
          ? `Apple Health synced • ${summaryParts.join(' • ')}`
          : 'Apple Health synced';
      })()
    : 'Apple Health available';

  const [view, setView] = useState<ViewMode>('chart');
  const [range, setRange] = useState<RangeKey>('3M');

  useEffect(() => {
    if (!loadedRange) {
      dispatch(fetchCheckInsRequested({ range: '3M' }));
      return;
    }

    if (!doesLoadedRangeCoverRequestedRange(loadedRange, range)) {
      dispatch(fetchCheckInsRequested({ range }));
    }
  }, [dispatch, loadedRange, range]);

  const latest = useMemo(() => {
    if (!items?.length) return null;

    return (
      [...items]
        .filter(
          (ci) => typeof ci.representedDate === 'string' && ci.weightKg != null
        )
        .sort(
          (a, b) =>
            parseRepresentedDate(b.representedDate as string).getTime() -
            parseRepresentedDate(a.representedDate as string).getTime()
        )[0] ?? null
    );
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items.length) return [];

    const end = new Date();
    const start = startDateForRange(range, end);

    return [...items]
      .filter((ci) => {
        if (!ci.representedDate) return false;

        const representedDate = parseRepresentedDate(ci.representedDate);
        return representedDate >= start && representedDate <= end;
      })
      .sort(
        (a, b) =>
          parseRepresentedDate(a.representedDate as string).getTime() -
          parseRepresentedDate(b.representedDate as string).getTime()
      );
  }, [items, range]);

  const listItems = useMemo(() => {
    const byDate = new Map<string, MappedCheckIn[]>();

    for (const item of filteredItems) {
      if (!item.representedDate || item.weightKg == null) continue;

      const existing = byDate.get(item.representedDate) ?? [];
      existing.push(item);
      byDate.set(item.representedDate, existing);
    }

    const pickMostRecentOfSource = (
      items: MappedCheckIn[],
      source: 'manual' | 'apple_health' | 'legacy'
    ) => {
      return (
        [...items]
          .filter((item) => item.weightSource === source)
          .sort((a, b) => {
            const aTime = a.recordedAt ? new Date(a.recordedAt).getTime() : 0;
            const bTime = b.recordedAt ? new Date(b.recordedAt).getTime() : 0;
            return bTime - aTime;
          })[0] ?? null
      );
    };

    return [...byDate.entries()]
      .map(([representedDate, itemsForDay]) => {
        const manualItem = pickMostRecentOfSource(itemsForDay, 'manual');
        const appleItem = pickMostRecentOfSource(itemsForDay, 'apple_health');
        const legacyItem = pickMostRecentOfSource(itemsForDay, 'legacy');

        const effectiveItem = manualItem ?? appleItem ?? legacyItem;
        if (!effectiveItem) return null;

        const distinctSources = new Set(
          itemsForDay
            .map((item) => item.weightSource)
            .filter((s): s is 'manual' | 'apple_health' | 'legacy' =>
              Boolean(s)
            )
        );

        const hasWeightConflict =
          distinctSources.has('manual') && distinctSources.has('apple_health');

        const alternateWeights = itemsForDay
          .filter(
            (item) =>
              item.weightKg != null &&
              item.weightSource != null &&
              !(
                item.weightSource === effectiveItem.weightSource &&
                item.weightKg === effectiveItem.weightKg &&
                item.recordedAt === effectiveItem.recordedAt
              )
          )
          .map((item) => ({
            source: item.weightSource as 'manual' | 'apple_health' | 'legacy',
            weightKg: item.weightKg as number,
            recordedAt: item.recordedAt ?? null
          }))
          .sort((a, b) => {
            const aTime = a.recordedAt ? new Date(a.recordedAt).getTime() : 0;
            const bTime = b.recordedAt ? new Date(b.recordedAt).getTime() : 0;
            return bTime - aTime;
          })
          .map(({ source, weightKg }) => ({ source, weightKg }));

        return {
          ...effectiveItem,
          representedDate,
          weightSource: effectiveItem.weightSource,
          hasWeightConflict,
          alternateWeights
        };
      })
      .filter(
        (
          item
        ): item is MappedCheckIn & {
          representedDate: string;
          alternateWeights: Array<{
            source: 'manual' | 'apple_health' | 'legacy';
            weightKg: number;
          }>;
        } => item != null
      )
      .sort(
        (a, b) =>
          parseRepresentedDate(b.representedDate as string).getTime() -
          parseRepresentedDate(a.representedDate as string).getTime()
      );
  }, [filteredItems]);

  const chartItems = useMemo(() => {
    return [...listItems].sort(
      (a, b) =>
        parseRepresentedDate(a.representedDate as string).getTime() -
        parseRepresentedDate(b.representedDate as string).getTime()
    );
  }, [listItems]);

  const handleViewChange = (_: unknown, next: ViewMode | null) => {
    if (!next) return;
    setView(next);
  };

  return (
    <Box>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          minWidth: 0
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent={{ xs: 'normal', md: 'space-between' }}
          alignItems={{ xs: 'normal', md: 'center' }}
          gap={1}
        >
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            gap={2}
          >
            <Typography variant='h6'>Weigh-Ins</Typography>
            {loading ? <CircularProgress size={18} /> : null}
            <Stack direction='row' gap={1}>
              <IconButton
                aria-label='analyze trend metrics'
                onClick={() => dispatch(trendMetricsRequested({ range }))}
                disabled={trend.metrics.status === 'loading'}
              >
                <InsightsIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Stack
            direction='row'
            alignItems='center'
            gap={1}
            sx={{ minWidth: 0, flexWrap: 'wrap' }}
          >
            <ToggleButtonGroup
              size='small'
              value={range}
              exclusive
              onChange={(_, next: RangeKey | null) => {
                if (!next) return;
                setRange(next);
              }}
            >
              <ToggleButton value='1W'>1W</ToggleButton>
              <ToggleButton value='1M'>1M</ToggleButton>
              <ToggleButton value='3M'>3M</ToggleButton>
              <ToggleButton value='6M'>6M</ToggleButton>
              <ToggleButton value='12M'>12M</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              size='small'
              value={view}
              exclusive
              onChange={handleViewChange}
            >
              <ToggleButton value='chart'>Chart</ToggleButton>
              <ToggleButton value='list'>List</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {healthKit.lastSummary || healthKit.syncing || healthKit.error ? (
          <Typography
            variant='caption'
            sx={{
              mt: 0.5,
              display: 'inline-flex',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              borderRadius: 999,
              backgroundColor: healthKit.error
                ? 'rgba(211, 47, 47, 0.15)'
                : healthKit.syncing
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(76, 175, 80, 0.15)',
              color: healthKit.error
                ? 'error.main'
                : healthKit.syncing
                ? 'text.secondary'
                : 'success.main',
              fontWeight: 700
            }}
          >
            {appleHealthStatusText}
          </Typography>
        ) : null}

        {error ? (
          <Typography variant='body2' sx={{ mt: 1 }} color='error'>
            {error}
          </Typography>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <Typography variant='body2' sx={{ mt: 1 }} color='text.secondary'>
            No weigh-ins yet.
          </Typography>
        ) : null}

        <Stack direction='row' gap={3} alignItems='center' mt={1}>
          {!loading && items.length > 0 && latest ? (
            <Typography variant='body2' color='text.secondary'>
              Latest: {latest.representedDate ?? '--'} —{' '}
              {latest.weightKg != null
                ? `${formatWeight(
                    latest.weightKg,
                    weightUnitPref
                  )} ${weightUnitPref}`
                : '--'}
            </Typography>
          ) : null}

          {trendDirectionLabel ? (
            <Typography
              variant='body2'
              sx={{
                color:
                  avgChangePerWeekKg == null
                    ? 'text.secondary'
                    : avgChangePerWeekKg < -0.05
                    ? 'success.main'
                    : avgChangePerWeekKg > 0.05
                    ? 'warning.main'
                    : 'text.secondary',
                fontWeight: 600
              }}
            >
              Trend: {trendDirectionLabel}
            </Typography>
          ) : null}

          {avgWeighInsPerWeek != null && (
            <Typography
              variant='body2'
              sx={{ color: consistencyTone, fontWeight: 600 }}
            >
              Consistency: {avgWeighInsPerWeek.toFixed(1)} weigh-ins/week
              {avgWeighInsPerWeek < 4
                ? ' • More frequent weigh-ins improve trend confidence'
                : ''}
            </Typography>
          )}
        </Stack>

        {trend.metrics.status === 'loading' ? (
          <Typography variant='body2' sx={{ mt: 1 }} color='text.secondary'>
            Analyzing trend…
          </Typography>
        ) : null}

        {trend.metrics.status === 'failed' ? (
          <Typography variant='body2' sx={{ mt: 1 }} color='error'>
            {trend.metrics.error}
          </Typography>
        ) : null}

        {trend.metrics.status === 'succeeded' && trend.metrics.data?.metrics ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} sx={{ mt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Avg (last 7d):{' '}
              {trend.metrics.data.metrics.avgLast7dKg != null
                ? `${formatWeight(
                    trend.metrics.data.metrics.avgLast7dKg,
                    weightUnitPref
                  )} ${weightUnitPref}`
                : '--'}
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Avg (prev 7d):{' '}
              {trend.metrics.data.metrics.avgPrev7dKg != null
                ? `${formatWeight(
                    trend.metrics.data.metrics.avgPrev7dKg,
                    weightUnitPref
                  )} ${weightUnitPref}`
                : '--'}
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Avg change/wk:{' '}
              {trend.metrics.data.metrics.avgChangePerWeekKg != null
                ? `${formatWeight(
                    trend.metrics.data.metrics.avgChangePerWeekKg,
                    weightUnitPref
                  )} ${weightUnitPref}`
                : '--'}
            </Typography>
          </Stack>
        ) : null}

        {!loading && items.length > 0 ? (
          <Box sx={{ mt: 1, minWidth: 0, minHeight: 0 }}>
            <Typography variant='caption' sx={{ display: 'block', mt: 1 }}>
              Range: {range} • Showing {listItems.length} day(s)
            </Typography>

            {view === 'chart' ? (
              <CheckInsChart
                filteredItems={chartItems}
                weightUnitPref={weightUnitPref}
              />
            ) : (
              <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
                <CheckInList
                  filteredItems={listItems}
                  weightUnitPref={weightUnitPref}
                  onOpenCheckIn={(date) => {
                    const clickedItem =
                      listItems.find((ci) => ci.representedDate === date) ??
                      null;
                    handleOpenNewCheckIn?.(clickedItem);
                  }}
                />
              </Box>
            )}
          </Box>
        ) : null}
      </Paper>
    </Box>
  );
};

export default WeighInsPanel;
