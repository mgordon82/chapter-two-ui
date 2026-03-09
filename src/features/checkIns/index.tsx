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
import { trendAnalyzeRequested } from '../trend/redux/trendSlice';

const CheckInsPanel = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.checkIns);

  const unitPrefs = useAppSelector(selectUserUnitPrefs);
  const trend = useAppSelector((s) => s.trend);

  const weightUnitPref = unitPrefs?.weightUnitPref === 'lbs' ? 'lbs' : 'kg';

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
              aria-label='insights'
              onClick={() => dispatch(trendAnalyzeRequested({ range }))}
              disabled={trend.status === 'loading'}
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

        {trend.status === 'loading' ? (
          <Typography variant='body2' sx={{ mt: 1 }} color='text.secondary'>
            Analyzing trend…
          </Typography>
        ) : null}

        {trend.status === 'failed' ? (
          <Typography variant='body2' sx={{ mt: 1 }} color='error'>
            {trend.error}
          </Typography>
        ) : null}

        {trend.status === 'succeeded' && trend.data?.metrics ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} sx={{ mt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Avg (last 7d):{' '}
              {trend.data.metrics.avgLast7dKg != null
                ? `${formatWeight(
                    trend.data.metrics.avgLast7dKg,
                    weightUnitPref
                  )} ${weightUnitPref}`
                : '--'}
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Avg (prev 7d):{' '}
              {trend.data.metrics.avgPrev7dKg != null
                ? `${formatWeight(
                    trend.data.metrics.avgPrev7dKg,
                    weightUnitPref
                  )} ${weightUnitPref}`
                : '--'}
            </Typography>

            <Typography variant='body2' color='text.secondary'>
              Avg change/wk:{' '}
              {trend.data.metrics.avgChangePerWeekKg != null
                ? `${formatWeight(
                    trend.data.metrics.avgChangePerWeekKg,
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
