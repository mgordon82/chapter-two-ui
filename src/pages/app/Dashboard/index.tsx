import { useEffect, useMemo, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';

import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FlagIcon from '@mui/icons-material/Flag';
import TimelineIcon from '@mui/icons-material/Timeline';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import StatCard from '../../../components/sections/statCard';
import TrendAnalysisCard from '../../../features/trend';
import type { WeightUnitPref } from '../../../types/units';
import { toDisplayWeight } from '../../../features/checkIns/helpers';
import { fetchDailyMetricsRequested } from '../../../features/healthMetrics/redux/healthMetricsSlice';
import { healthKitSyncRequested } from '../../../features/healthKit/redux/healthKitSlice';
import { fetchCheckInsRequested } from '../../../features/checkIns/redux/checkInsSlice';
import PullToRefresh from '../../../components/mobile/PullToRefresh';
import { mlToLiters, mlToOz } from '../../../utils/conversions/volume';
import BodyTrendsCard from '../../../components/sections/bodyTrendsCard';
import ProgressToGoalCard from '../../../components/sections/ProgressToGoalCard';
import RemainingToGoalCard from '../../../components/sections/RemaingToGoalCard';

const Dashboard = () => {
  const dispatch = useAppDispatch();

  const trend = useAppSelector((s) => s.trend);
  const healthMetricsDaily = useAppSelector((s) => s.healthMetrics.daily);

  const profileData = useAppSelector(
    (state) => state.nutritionCalculator?.loadedProfile?.profile ?? null
  );

  const checkIns = useAppSelector((state) => state.checkIns.items);

  const healthKit = useAppSelector((s) => s.healthKit);
  const hasAutoSyncedRef = useRef(false);

  useEffect(() => {
    if (
      !healthMetricsDaily.steps.loading &&
      healthMetricsDaily.steps.loadedRange !== '30D'
    ) {
      dispatch(
        fetchDailyMetricsRequested({
          metricType: 'steps',
          range: '30D'
        })
      );
    }
  }, [
    dispatch,
    healthMetricsDaily.steps.loading,
    healthMetricsDaily.steps.loadedRange
  ]);

  useEffect(() => {
    if (
      !healthMetricsDaily.water.loading &&
      healthMetricsDaily.water.loadedRange !== '30D'
    ) {
      dispatch(
        fetchDailyMetricsRequested({
          metricType: 'water',
          range: '30D'
        })
      );
    }
  }, [
    dispatch,
    healthMetricsDaily.water.loading,
    healthMetricsDaily.water.loadedRange
  ]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (hasAutoSyncedRef.current) return;
    if (healthKit.syncing) return;

    hasAutoSyncedRef.current = true;
    dispatch(healthKitSyncRequested());
  }, [dispatch, healthKit.syncing]);

  const todayDateKey = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const latestStepsItem = useMemo(() => {
    const stepItems = healthMetricsDaily.steps.items.filter(
      (item) => item.metricType === 'steps' && !item.isDeleted
    );

    if (!stepItems.length) return null;

    const todayItem =
      [...stepItems]
        .sort((a, b) => b.date.localeCompare(a.date))
        .find((item) => {
          return item.date === todayDateKey;
        }) ?? null;

    return todayItem;
  }, [healthMetricsDaily.steps.items, todayDateKey]);

  const latestWaterItem = useMemo(() => {
    const waterItems = healthMetricsDaily.water.items.filter(
      (item) => item.metricType === 'water' && !item.isDeleted
    );

    if (!waterItems.length) return null;

    const todayItem =
      [...waterItems]
        .sort((a, b) => b.date.localeCompare(a.date))
        .find((item) => {
          return item.date === todayDateKey;
        }) ?? null;

    return todayItem;
  }, [healthMetricsDaily.water.items, todayDateKey]);

  const latestStepsValue = latestStepsItem?.value ?? null;
  const stepGoalDaily = profileData?.stepGoalDaily ?? null;

  const stepsCardValue =
    latestStepsValue == null
      ? '—'
      : stepGoalDaily && stepGoalDaily > 0
      ? `${latestStepsValue.toLocaleString()} / ${stepGoalDaily.toLocaleString()}`
      : latestStepsValue.toLocaleString();

  const latestStepsHelper = useMemo(() => {
    if (!latestStepsItem) {
      return stepGoalDaily ? 'No steps logged yet today' : 'No step data yet';
    }

    const sourceLabel =
      latestStepsItem.source?.type === 'manual' ? 'Manual' : 'Apple Health';

    if (!latestStepsItem.updatedAt) return `${sourceLabel} • Logged today`;

    const updatedAt = new Date(latestStepsItem.updatedAt);

    if (Number.isNaN(updatedAt.getTime())) {
      return `${sourceLabel} • Logged today`;
    }

    const timeText = updatedAt.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });

    return `${sourceLabel} • Updated ${timeText}`;
  }, [latestStepsItem, stepGoalDaily]);

  const stepProgressPct =
    latestStepsValue != null && stepGoalDaily && stepGoalDaily > 0
      ? Math.min(100, (latestStepsValue / stepGoalDaily) * 100)
      : 0;

  const latestWaterMl = latestWaterItem?.value ?? null;
  const waterGoalDailyMl = profileData?.waterGoalDailyMl ?? null;
  const volumeUnitPref = profileData?.preferences?.volumeUnitPref ?? 'ml';

  const latestWaterDisplay =
    latestWaterMl == null
      ? null
      : volumeUnitPref === 'oz'
      ? mlToOz(latestWaterMl)
      : mlToLiters(latestWaterMl);

  const waterGoalDisplay =
    waterGoalDailyMl == null
      ? null
      : volumeUnitPref === 'oz'
      ? mlToOz(waterGoalDailyMl)
      : mlToLiters(waterGoalDailyMl);

  const waterUnitLabel = volumeUnitPref === 'oz' ? 'oz' : 'L';

  const waterCardValue =
    latestWaterDisplay == null
      ? '—'
      : waterGoalDisplay != null && waterGoalDisplay > 0
      ? `${latestWaterDisplay.toFixed(
          volumeUnitPref === 'oz' ? 0 : 1
        )} / ${waterGoalDisplay.toFixed(
          volumeUnitPref === 'oz' ? 0 : 1
        )} ${waterUnitLabel}`
      : `${latestWaterDisplay.toFixed(
          volumeUnitPref === 'oz' ? 0 : 1
        )} ${waterUnitLabel}`;

  const waterProgressPct =
    latestWaterMl != null && waterGoalDailyMl && waterGoalDailyMl > 0
      ? Math.min(100, (latestWaterMl / waterGoalDailyMl) * 100)
      : 0;

  const latestWaterHelper = useMemo(() => {
    if (!latestWaterItem) {
      return waterGoalDailyMl
        ? 'No water logged yet today'
        : 'No water data yet';
    }

    const sourceLabel =
      latestWaterItem.source?.type === 'manual' ? 'Manual' : 'Apple Health';

    if (!latestWaterItem.updatedAt) return `${sourceLabel} • Logged today`;

    const updatedAt = new Date(latestWaterItem.updatedAt);

    if (Number.isNaN(updatedAt.getTime())) {
      return `${sourceLabel} • Logged today`;
    }

    const timeText = updatedAt.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });

    return `${sourceLabel} • Updated ${timeText}`;
  }, [latestWaterItem, waterGoalDailyMl]);

  const pickWeightUnitPref = (value: unknown): WeightUnitPref | null => {
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;

    const prefs = obj.preferences;
    if (prefs && typeof prefs === 'object') {
      const w = (prefs as Record<string, unknown>).weightUnitPref;
      if (w === 'kg' || w === 'lbs') return w;
    }

    const direct = obj.weightUnitPref;
    if (direct === 'kg' || direct === 'lbs') return direct;

    const unitPrefs = obj.unitPrefs;
    if (unitPrefs && typeof unitPrefs === 'object') {
      const w2 = (unitPrefs as Record<string, unknown>).weightUnitPref;
      if (w2 === 'kg' || w2 === 'lbs') return w2;
    }

    return null;
  };

  const authCurrentUser = useAppSelector((s) => s.auth.currentUser as unknown);
  const authWeightUnitPref = pickWeightUnitPref(authCurrentUser);

  const unitPrefRaw =
    authWeightUnitPref ?? profileData?.preferences?.weightUnitPref ?? null;
  const unitReady = unitPrefRaw === 'kg' || unitPrefRaw === 'lbs';

  const unitPref: WeightUnitPref = unitReady ? unitPrefRaw : 'kg';
  const displayUnitLabel = unitPref === 'lbs' ? 'lb' : 'kg';

  type CheckInWithWeightAndRecordedAt = {
    weightKg: number;
    recordedAt: string;
  } & (typeof checkIns)[number];

  const nonDeleted = useMemo(
    () =>
      checkIns.filter(
        (c): c is CheckInWithWeightAndRecordedAt =>
          !c.isDeleted &&
          typeof c.weightKg === 'number' &&
          typeof c.recordedAt === 'string' &&
          c.recordedAt.length > 0
      ),
    [checkIns]
  );

  const sorted = useMemo(() => {
    return [...nonDeleted].sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
  }, [nonDeleted]);

  const latest = sorted.length ? sorted[sorted.length - 1] : null;

  const profileWeightKg = profileData?.weightKg ?? null;
  const goalWeightKg = profileData?.goalWeightKg ?? null;
  const hasGoal = goalWeightKg != null && goalWeightKg > 0;

  const currentWeightKg = latest?.weightKg ?? profileWeightKg ?? 0;

  const currentWeight = toDisplayWeight(currentWeightKg, unitPref);
  const goalWeight = hasGoal ? toDisplayWeight(goalWeightKg, unitPref) : 0;

  const lastCheckInLabel = latest
    ? new Date(latest.recordedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : 'No check-ins yet';

  const serverAvgChangeKg =
    trend.metrics.data?.metrics.avgChangePerWeekKg ?? null;
  const serverAvgChange =
    serverAvgChangeKg == null
      ? null
      : toDisplayWeight(serverAvgChangeKg, unitPref);

  const serverConfidence = trend.metrics.data?.confidence ?? 'low';
  const last7n = trend.metrics.data?.windows?.last7?.n ?? 0;
  const prev7n = trend.metrics.data?.windows?.prev7?.n ?? 0;

  const avgTone =
    serverAvgChange == null ||
    serverConfidence === 'low' ||
    trend.metrics.data?.status === 'insufficient_data'
      ? 'warn'
      : serverAvgChange <= 0
      ? 'good'
      : 'bad';

  const avgChip =
    serverConfidence === 'high'
      ? 'High confidence'
      : serverConfidence === 'medium'
      ? 'Med confidence'
      : 'Low confidence';

  const avgHelper = !trend.metrics.data
    ? 'Run “Generate Insight” to calculate'
    : trend.metrics.data.status === 'insufficient_data'
    ? `Need check-ins in both weeks • ${last7n} vs ${prev7n}`
    : `Avg(last 7d) − Avg(prev 7d) • ${last7n} vs ${prev7n} check-ins`;

  const startingWeightKg =
    profileData?.startingWeightKg ?? profileWeightKg ?? currentWeightKg;

  const progressLostKg = Math.max(0, startingWeightKg - currentWeightKg);
  const totalToLoseKg =
    hasGoal && startingWeightKg > goalWeightKg
      ? startingWeightKg - goalWeightKg
      : 0;
  const progressLost = toDisplayWeight(progressLostKg, unitPref);
  const totalToLose = toDisplayWeight(totalToLoseKg, unitPref);

  const progressPct =
    hasGoal && totalToLoseKg > 0
      ? Math.min(100, Math.max(0, (progressLostKg / totalToLoseKg) * 100))
      : 0;

  const remainingToGoal = hasGoal
    ? toDisplayWeight(Math.max(0, currentWeightKg - goalWeightKg), unitPref)
    : 0;

  const handleRefresh = async () => {
    dispatch(healthKitSyncRequested());
    dispatch(fetchCheckInsRequested({ range: '3M' }));
    dispatch(
      fetchDailyMetricsRequested({
        metricType: 'steps',
        range: '30D'
      })
    );
    dispatch(
      fetchDailyMetricsRequested({
        metricType: 'water',
        range: '30D'
      })
    );
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <Box sx={{ width: '100%' }}>
        <Stack spacing={2.25} sx={{ width: '100%' }}>
          <TrendAnalysisCard
            trend={trend}
            displayUnitLabel={displayUnitLabel}
            unitPref={unitPref}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))'
              },
              gap: 2,
              width: '100%',
              alignItems: 'stretch'
            }}
          >
            <StatCard
              title='Current Weight'
              value={unitReady ? `${currentWeight} ${displayUnitLabel}` : '—'}
              helper={`Last check-in: ${lastCheckInLabel}`}
              icon={<TrendingDownIcon fontSize='small' />}
              tone='primary'
            />

            <StatCard
              title='Goal Weight'
              value={
                hasGoal && unitReady ? `${goalWeight} ${displayUnitLabel}` : '—'
              }
              helper={
                <>
                  {hasGoal ? 'Goal set in ' : 'Set a goal weight in '}
                  <Typography
                    component={RouterLink}
                    to='/mipt/my-profile'
                    sx={{
                      display: 'inline',
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    profile
                  </Typography>
                </>
              }
              icon={<FlagIcon fontSize='small' />}
              tone='goal'
            />

            <StatCard
              title='Avg Weekly Change'
              value={
                !unitReady || serverAvgChange == null
                  ? '—'
                  : `${serverAvgChange > 0 ? '+' : ''}${serverAvgChange.toFixed(
                      1
                    )} ${displayUnitLabel}/week`
              }
              helper={avgHelper}
              chipLabel={avgChip}
              icon={<TimelineIcon fontSize='small' />}
              tone={avgTone}
            />

            {(latestStepsItem || stepGoalDaily) && (
              <StatCard
                title='Steps Today'
                value={stepsCardValue}
                helper={latestStepsHelper}
                icon={<DirectionsWalkIcon fontSize='small' />}
                tone='primary'
                progress={stepGoalDaily ? stepProgressPct : null}
              />
            )}

            {(latestWaterItem || waterGoalDailyMl) && (
              <StatCard
                title='Water Today'
                value={waterCardValue}
                helper={latestWaterHelper}
                icon={<WaterDropIcon fontSize='small' />}
                tone='primary'
                progress={waterGoalDailyMl ? waterProgressPct : null}
              />
            )}
          </Box>

          <BodyTrendsCard />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems='stretch'
            sx={{ width: '100%' }}
          >
            <ProgressToGoalCard
              progressPct={progressPct}
              progressLost={progressLost}
              displayUnitLabel={displayUnitLabel}
              totalToLose={totalToLose}
            />
            <RemainingToGoalCard
              remainingToGoal={remainingToGoal}
              hasGoal={hasGoal}
              serverAvgChange={serverAvgChange}
              currentWeight={currentWeight}
              goalWeight={goalWeight}
              displayUnitLabel={displayUnitLabel}
            />
          </Stack>
        </Stack>
      </Box>
    </PullToRefresh>
  );
};

export default Dashboard;
