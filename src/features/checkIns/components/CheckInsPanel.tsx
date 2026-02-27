import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton
} from '@mui/material';

import InsightsIcon from '@mui/icons-material/Insights';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  createCheckInRequested,
  fetchCheckInsRequested
} from '../redux/checkInsSlice';

import {
  selectLoadedUserProfile,
  selectUserUnitPrefs
} from '../../nutritionCalculator/redux/nutritionCalculatorSlice';

import {
  kgToLbsRounded,
  lbsToKgRounded
} from '../../../utils/conversions/weight';

type ViewMode = 'chart' | 'list';
type RangeKey = '1W' | '1M' | '3M' | '6M' | '12M';

function formatWeight(weightKg: number, unit: 'kg' | 'lbs') {
  if (!Number.isFinite(weightKg)) return '';
  if (unit === 'lbs') return String(kgToLbsRounded(weightKg, 1));
  return String(Number(weightKg.toFixed(1)));
}

function toDisplayWeight(weightKg: number, unit: 'kg' | 'lbs') {
  if (unit === 'lbs') return kgToLbsRounded(weightKg, 1);
  return Number(weightKg.toFixed(1));
}

function toIsoDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function formatDateTimeLabel(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function startDateForRange(range: RangeKey, end: Date) {
  const d = new Date(end);
  switch (range) {
    case '1W':
      d.setDate(d.getDate() - 7);
      return d;
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
}

type CheckInTooltipProps = {
  active?: boolean;
  label?: unknown;
  payload?: Array<{ value?: unknown }>;
  unit: 'kg' | 'lbs';
};

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

  // label is the X value (recordedAt ISO string)
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

const CheckInsPanel = () => {
  const dispatch = useAppDispatch();
  const { items, loading, creating, error } = useAppSelector((s) => s.checkIns);

  const unitPrefs = useAppSelector(selectUserUnitPrefs);
  const loadedProfile = useAppSelector(selectLoadedUserProfile);

  const weightUnitPref = unitPrefs?.weightUnitPref === 'lbs' ? 'lbs' : 'kg';

  // Default to chart view
  const [view, setView] = useState<ViewMode>('chart');

  // Range filter for chart
  const [range, setRange] = useState<RangeKey>('3M');

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

  // ----- dialog state -----
  const [open, setOpen] = useState(false);

  const today = useMemo(() => toIsoDateInputValue(new Date()), []);
  const [dateValue, setDateValue] = useState<string>(today);
  const [weightDisplay, setWeightDisplay] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const openDialog = () => {
    setDateValue(toIsoDateInputValue(new Date()));
    setWeightDisplay('');
    setNotes('');
    setOpen(true);
  };

  const closeDialog = () => setOpen(false);

  const handleSave = () => {
    const w = Number(weightDisplay);
    if (!Number.isFinite(w) || w <= 0) return;

    const recordedAtIso = new Date(`${dateValue}T12:00:00.000Z`).toISOString();

    const weightKg =
      weightUnitPref === 'lbs' ? lbsToKgRounded(w, 2) : Number(w.toFixed(2));

    dispatch(
      createCheckInRequested({
        recordedAt: recordedAtIso,
        weightKg,
        notes: notes.trim() ? notes.trim() : undefined
      })
    );

    setOpen(false);
  };

  const chartData = useMemo(() => {
    // items is newest-first; chart wants oldest-first
    const chronological = [...items].reverse();

    return chronological.map((ci) => ({
      id: ci._id,
      recordedAt: ci.recordedAt, // ✅ unique x-value
      weight: toDisplayWeight(ci.metrics.weightKg, weightUnitPref)
    }));
  }, [items, weightUnitPref]);

  const filteredChartData = useMemo(() => {
    if (chartData.length === 0) return chartData;

    // end at latest point we have (not necessarily "today")
    const end = new Date(chartData[chartData.length - 1].recordedAt);
    const start = startDateForRange(range, end).getTime();

    return chartData.filter((d) => new Date(d.recordedAt).getTime() >= start);
  }, [chartData, range]);

  const filteredItems = useMemo(() => {
    if (!items.length) return items;

    // items is newest-first
    const end = new Date(items[0].recordedAt);
    const start = startDateForRange(range, end).getTime();

    return items.filter((ci) => new Date(ci.recordedAt).getTime() >= start);
  }, [items, range]);

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
          backdropFilter: 'blur(4px)'
        }}
      >
        {/* Header */}
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

          <Stack direction='row' alignItems='center' gap={1}>
            <IconButton aria-label='insights'>
              <InsightsIcon />
            </IconButton>

            {/* Range filter (only relevant for chart view, but harmless always) */}
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

            <Button variant='outlined' onClick={openDialog} disabled={loading}>
              Add
            </Button>
          </Stack>
        </Stack>

        {/* Status / Summary */}
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
            Latest: {new Date(latest.recordedAt).toLocaleDateString()} —{' '}
            {formatWeight(latest.metrics.weightKg, weightUnitPref)}{' '}
            {weightUnitPref}
          </Typography>
        ) : null}

        {/* Body */}
        {!loading && items.length > 0 ? (
          <Box sx={{ mt: 1 }}>
            {view === 'chart' ? (
              <Box sx={{ width: '100%', height: 200 }}>
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
                    <YAxis
                      tick={{ fontSize: 12 }}
                      width={52}
                      domain={yDomain}
                    />
                    <Tooltip
                      content={<CheckInTooltip unit={weightUnitPref} />}
                      cursor={{ strokeDasharray: '4 4' }}
                      labelFormatter={(iso) => formatDateTimeLabel(String(iso))}
                    />

                    {goalWeightDisplay != null ? (
                      <ReferenceLine
                        y={goalWeightDisplay}
                        strokeDasharray='4 4'
                      />
                    ) : null}

                    <Line
                      type='monotone'
                      dataKey='weight'
                      strokeWidth={2}
                      dot={{ r: 3 }} // ✅ show dots
                      activeDot={{ r: 5 }} // ✅ emphasize hovered dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Stack spacing={0.5}>
                {filteredItems.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No check-ins in this range.
                  </Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {filteredItems.slice(0, 10).map((ci) => (
                      <Stack
                        key={ci._id}
                        direction='row'
                        justifyContent='space-between'
                      >
                        <Typography variant='body2'>
                          {new Date(ci.recordedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant='body2'>
                          {formatWeight(ci.metrics.weightKg, weightUnitPref)}{' '}
                          {weightUnitPref}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </Box>
        ) : null}
      </Paper>

      {/* Add Check-in Dialog */}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth='xs'>
        <DialogTitle>Add Check-in</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label='Date'
              type='date'
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label={`Weight (${weightUnitPref})`}
              type='number'
              value={weightDisplay}
              onChange={(e) => setWeightDisplay(e.target.value)}
              inputProps={{ min: 0, step: '0.1' }}
              autoFocus
            />

            <TextField
              label='Notes (optional)'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} disabled={creating}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSave} disabled={creating}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckInsPanel;
