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
    const weightParts: string[] = [];
    const stepsParts: string[] = [];
    const waterParts: string[] = [];

    if (lastSummary.weight.createdCount > 0) {
      weightParts.push(`${lastSummary.weight.createdCount} new`);
    }
    if (lastSummary.weight.duplicateCount > 0) {
      weightParts.push(`${lastSummary.weight.duplicateCount} duplicates`);
    }
    if (lastSummary.weight.conflictCount > 0) {
      weightParts.push(`${lastSummary.weight.conflictCount} conflicts`);
    }
    if (weightParts.length === 0 && lastSummary.weight.total > 0) {
      weightParts.push(`${lastSummary.weight.total} checked`);
    }

    if (lastSummary.steps.createdCount > 0) {
      stepsParts.push(`${lastSummary.steps.createdCount} new`);
    }
    if (lastSummary.steps.updatedCount > 0) {
      stepsParts.push(`${lastSummary.steps.updatedCount} updated`);
    }
    if (stepsParts.length === 0 && lastSummary.steps.total > 0) {
      stepsParts.push(`${lastSummary.steps.total} checked`);
    }

    if (lastSummary.water.createdCount > 0) {
      waterParts.push(`${lastSummary.water.createdCount} new`);
    }
    if (lastSummary.water.updatedCount > 0) {
      waterParts.push(`${lastSummary.water.updatedCount} updated`);
    }
    if (waterParts.length === 0 && lastSummary.water.total > 0) {
      waterParts.push(`${lastSummary.water.total} checked`);
    }

    const summaryParts: string[] = [];

    if (lastSummary.weight.total > 0) {
      summaryParts.push(`Weight: ${weightParts.join(', ')}`);
    }

    if (lastSummary.steps.total > 0) {
      summaryParts.push(`Steps: ${stepsParts.join(', ')}`);
    }

    if (lastSummary.water.total > 0) {
      summaryParts.push(`Water: ${waterParts.join(', ')}`);
    }

    tooltipTitle =
      summaryParts.length > 0
        ? `Apple Health synced • ${summaryParts.join(' • ')}`
        : 'Apple Health synced';
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
