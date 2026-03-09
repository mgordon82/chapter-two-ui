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

const CheckInsPanel = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.checkIns);

  const unitPrefs = useAppSelector(selectUserUnitPrefs);
  const trend = useAppSelector((s) => s.trend);

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

  const [view, setView] = useState<ViewMode>('chart');
  const [range, setRange] = useState<RangeKey>('3M');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCheckInsRequested());
  }, [dispatch]);

  const latest = useMemo(() => {
    if (!items?.length) return null;
    return [...items].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!items.length) return items;

    const end = new Date(items[0].recordedAt);
    const start = startDateForRange(range, end).getTime();

    return items.filter((ci) => new Date(ci.recordedAt).getTime() >= start);
  }, [items, range]);

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
          alignItems={{ xs: 'left', md: 'center' }}
        >
          <Stack
            direction='row'
            justifyContent='left'
            alignItems='center'
            gap={2}
          >
            <Typography variant='h6'>Check-ins</Typography>
            {loading ? <CircularProgress size={18} /> : null}
          </Stack>

          <Stack
            direction='row'
            alignItems='center'
            gap={1}
            sx={{ minWidth: 0, flexWrap: 'wrap' }}
          >
            <IconButton
              aria-label='analyze trend metrics'
              onClick={() => dispatch(trendMetricsRequested({ range }))}
              disabled={trend.metrics.status === 'loading'}
            >
              <InsightsIcon />
            </IconButton>

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

            <Button
              variant='outlined'
              onClick={() => setOpen(true)}
              disabled={loading}
            >
              Add
            </Button>
          </Stack>
        </Stack>

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
            {view === 'chart' ? (
              <CheckInsChart
                filteredItems={filteredItems}
                weightUnitPref={weightUnitPref}
                range={range}
              />
            ) : (
              <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
                <CheckInList
                  filteredItems={filteredItems}
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
