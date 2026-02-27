import { Stack, Typography } from '@mui/material';
import { formatWeight } from '../helpers';
import type { UnitPrefType } from '../types';
import type { CheckIn } from '../redux/checkInsSlice';

type CheckInListTypes = {
  filteredItems: CheckIn[];
  weightUnitPref: UnitPrefType;
};

const CheckInList = ({ filteredItems, weightUnitPref }: CheckInListTypes) => {
  return (
    <Stack spacing={0.5}>
      {filteredItems.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          No check-ins in this range.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {filteredItems.slice(0, 10).map((ci) => (
            <Stack key={ci._id} direction='row' justifyContent='space-between'>
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
  );
};

export default CheckInList;
