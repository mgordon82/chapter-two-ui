import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

import InsightsIcon from '@mui/icons-material/Insights';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCheckInsRequested } from './redux/checkInsSlice';
import { selectUserUnitPrefs } from '../nutritionCalculator/redux/nutritionCalculatorSlice';

import type { RangeKey, ViewMode } from './types';
import CheckInsChart from './components/Chart';
import CheckInList from './components/CheckInList';
import AddCheckInDialog from './components/AddCheckInDialog';
import { formatWeight, startDateForRange } from './helpers';
import { trendMetricsRequested } from '../trend/redux/trendSlice';
import HealthKitPanel from '../healthKit/components/HealthKitPanel';

const rangeRank: Record<RangeKey, number> = {
  '1W': 1,
  '1M': 2,
  '3M': 3,
  '6M': 4,
  '12M': 5
};

const doesLoadedRangeCoverRequestedRange = (
  loaded: RangeKey | null,
  requested: RangeKey
) => {
  if (!loaded) return false;
  return rangeRank[loaded] >= rangeRank[requested];
};

const CheckInsPanel = () => {
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
  const [open, setOpen] = useState(false);

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
    return [...items].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items.length) return [];

    const end = new Date();
    const start = startDateForRange(range, end);

    return [...items]
      .filter((ci) => {
        const recordedAt = new Date(ci.recordedAt);
        return recordedAt >= start && recordedAt <= end;
      })
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      );
  }, [items, range]);

  const listItems = useMemo(() => {
    return [...filteredItems].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
  }, [filteredItems]);

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
            <Typography variant='h6'>Check-ins</Typography>
            {loading ? <CircularProgress size={18} /> : null}
            <Stack direction='row' gap={1}>
              <HealthKitPanel />
              <IconButton
                aria-label='analyze trend metrics'
                onClick={() => dispatch(trendMetricsRequested({ range }))}
                disabled={trend.metrics.status === 'loading'}
              >
                <InsightsIcon />
              </IconButton>
              <Button
                variant='outlined'
                onClick={() => setOpen(true)}
                disabled={loading}
              >
                + Add
              </Button>
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
            No check-ins yet.
          </Typography>
        ) : null}

        {!loading && items.length > 0 && latest ? (
          <Typography variant='body2' sx={{ mt: 1 }} color='text.secondary'>
            Latest:{' '}
            {new Date(latest.recordedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}{' '}
            — {formatWeight(latest.metrics.weightKg, weightUnitPref)}{' '}
            {weightUnitPref}
          </Typography>
        ) : null}

        {trendDirectionLabel ? (
          <Typography
            variant='body2'
            sx={{
              mt: 1,
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
            sx={{ mt: 0.5, color: consistencyTone, fontWeight: 600 }}
          >
            Consistency: {avgWeighInsPerWeek.toFixed(1)} weigh-ins/week
            {avgWeighInsPerWeek < 4
              ? ' • More frequent weigh-ins improve trend confidence'
              : ''}
          </Typography>
        )}

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
              Range: {range} • Showing {filteredItems.length} item(s)
            </Typography>
            {view === 'chart' ? (
              <CheckInsChart
                filteredItems={filteredItems}
                weightUnitPref={weightUnitPref}
              />
            ) : (
              <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
                <CheckInList
                  filteredItems={listItems}
                  weightUnitPref={weightUnitPref}
                />
              </Box>
            )}
          </Box>
        ) : null}
      </Paper>

      <AddCheckInDialog open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

export default CheckInsPanel;
