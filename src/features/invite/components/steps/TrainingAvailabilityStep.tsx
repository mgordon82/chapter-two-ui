import {
  Checkbox,
  ListItemText,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import type { InvitationFormValues } from '../../types';

type TrainingAvailabilityStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const TrainingAvailabilityStep = ({
  values,
  setField
}: TrainingAvailabilityStepProps) => {
  const showDays = Number(values.trainingDaysPerWeek) > 0;

  return (
    <Stack spacing={3}>
      <TextField
        select
        fullWidth
        label='How much time do you have per session?'
        value={values.trainingTimePerSession || ''}
        onChange={(e) => setField('trainingTimePerSession', e.target.value)}
      >
        <MenuItem value=''>Select</MenuItem>
        <MenuItem value='under_30'>Under 30 minutes</MenuItem>
        <MenuItem value='30_45'>30–45 minutes</MenuItem>
        <MenuItem value='45_60'>45–60 minutes</MenuItem>
        <MenuItem value='60_plus'>60+ minutes</MenuItem>
      </TextField>

      <TextField
        select
        fullWidth
        label='How many days per week can you train?'
        value={values.trainingDaysPerWeek || ''}
        onChange={(e) => setField('trainingDaysPerWeek', e.target.value)}
      >
        <MenuItem value=''>Select</MenuItem>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <MenuItem key={d} value={String(d)}>
            {d}
          </MenuItem>
        ))}
      </TextField>

      {showDays && (
        <TextField
          select
          fullWidth
          label='Which days can you train?'
          value={values.trainingDays}
          onChange={(e) =>
            setField(
              'trainingDays',
              typeof e.target.value === 'string'
                ? e.target.value.split(',')
                : e.target.value
            )
          }
          SelectProps={{
            multiple: true,
            renderValue: (selected) => (selected as string[]).join(', ')
          }}
        >
          {[
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ].map((day) => (
            <MenuItem key={day} value={day}>
              <Checkbox checked={values.trainingDays.includes(day)} />
              <ListItemText primary={day} />
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
};

export default TrainingAvailabilityStep;
