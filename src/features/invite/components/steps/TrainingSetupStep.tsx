import {
  Checkbox,
  ListItemText,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import type { InvitationFormValues } from '../../types';

type TrainingSetupStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const TrainingSetupStep = ({ values, setField }: TrainingSetupStepProps) => {
  const showHomeEquipment =
    values.trainingLocation === 'home' || values.trainingLocation === 'both';

  const showGymEquipment =
    values.trainingLocation === 'gym' || values.trainingLocation === 'both';

  return (
    <Stack spacing={3}>
      <TextField
        select
        fullWidth
        label='Where will you be training?'
        value={values.trainingLocation || ''}
        onChange={(e) =>
          setField(
            'trainingLocation',
            e.target.value as InvitationFormValues['trainingLocation']
          )
        }
      >
        <MenuItem value=''>Select</MenuItem>
        <MenuItem value='home'>Home</MenuItem>
        <MenuItem value='gym'>Gym</MenuItem>
        <MenuItem value='both'>Both</MenuItem>
      </TextField>

      {showHomeEquipment && (
        <TextField
          select
          fullWidth
          label='What equipment do you have at home?'
          value={values.homeEquipment}
          onChange={(e) =>
            setField(
              'homeEquipment',
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
            'Dumbbells',
            'Barbell',
            'Bench',
            'Resistance Bands',
            'Kettlebells',
            'Pull-up Bar',
            'Cardio Machine',
            'None'
          ].map((item) => (
            <MenuItem key={item} value={item}>
              <Checkbox checked={values.homeEquipment.includes(item)} />
              <ListItemText primary={item} />
            </MenuItem>
          ))}
        </TextField>
      )}

      {showGymEquipment && (
        <TextField
          select
          fullWidth
          label='What equipment does your gym have?'
          value={values.gymEquipment}
          onChange={(e) =>
            setField(
              'gymEquipment',
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
            'Barbells / Squat Racks',
            'Cable Machines',
            'Cardio Machines',
            'Functional Training Area',
            'Machines',
            'Free Weights',
            'Full Gym'
          ].map((item) => (
            <MenuItem key={item} value={item}>
              <Checkbox checked={values.gymEquipment.includes(item)} />
              <ListItemText primary={item} />
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
};

export default TrainingSetupStep;
