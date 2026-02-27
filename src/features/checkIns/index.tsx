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

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  createCheckInRequested,
  fetchCheckInsRequested
} from './redux/checkInsSlice';

import { selectUserUnitPrefs } from '../nutritionCalculator/redux/nutritionCalculatorSlice';

import { lbsToKgRounded } from '../../utils/conversions/weight';
import type { RangeKey, ViewMode } from './types';
import CheckInsChart from './components/Chart';
import CheckInList from './components/CheckInList';
import {
  formatWeight,
  startDateForRange,
  toIsoDateInputValue
} from './helpers';

const CheckInsPanel = () => {
  const dispatch = useAppDispatch();
  const { items, loading, creating, error } = useAppSelector((s) => s.checkIns);

  const unitPrefs = useAppSelector(selectUserUnitPrefs);

  const weightUnitPref = unitPrefs?.weightUnitPref === 'lbs' ? 'lbs' : 'kg';
  const today = useMemo(() => toIsoDateInputValue(new Date()), []);

  const [view, setView] = useState<ViewMode>('chart');
  const [range, setRange] = useState<RangeKey>('3M');
  const [open, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState<string>(today);
  const [weightDisplay, setWeightDisplay] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

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
            <IconButton aria-label='insights'>
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

            <Button variant='outlined' onClick={openDialog} disabled={loading}>
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
            Latest: {new Date(latest.recordedAt).toLocaleDateString()} —{' '}
            {formatWeight(latest.metrics.weightKg, weightUnitPref)}{' '}
            {weightUnitPref}
          </Typography>
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
              <CheckInList
                filteredItems={filteredItems}
                weightUnitPref={weightUnitPref}
              />
            )}
          </Box>
        ) : null}
      </Paper>

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
