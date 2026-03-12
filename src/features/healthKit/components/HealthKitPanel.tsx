import { Capacitor } from '@capacitor/core';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { healthKitSyncRequested } from '../redux/healthKitSlice';

const HealthKitPanel = () => {
  const isNative = Capacitor.isNativePlatform();
  const dispatch = useAppDispatch();
  const { syncing, error, lastSummary } = useAppSelector((s) => s.healthKit);

  if (!isNative) return null;

  let tooltipTitle = 'Sync Apple Health';

  if (syncing) {
    tooltipTitle = 'Syncing Apple Health…';
  } else if (error) {
    tooltipTitle = `Apple Health sync failed: ${error}`;
  } else if (lastSummary) {
    tooltipTitle = `Apple Health synced • ${lastSummary.createdCount} new, ${lastSummary.duplicateCount} duplicates`;
  }

  return (
    <Tooltip title={tooltipTitle}>
      <span>
        <IconButton
          aria-label='sync apple health'
          onClick={() => dispatch(healthKitSyncRequested())}
          disabled={syncing}
        >
          {syncing ? <CircularProgress size={20} /> : <HealthAndSafetyIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default HealthKitPanel;
