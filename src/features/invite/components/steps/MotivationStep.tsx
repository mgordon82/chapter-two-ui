import { MenuItem, Stack, TextField } from '@mui/material';
import type { InvitationFormValues } from '../../types';

type MotivationStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const MotivationStep = ({ values, setField }: MotivationStepProps) => {
  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label='What motivates you?'
        value={values.motivationReason || ''}
        onChange={(e) => setField('motivationReason', e.target.value)}
      />

      <TextField
        select
        fullWidth
        label='How are you best motivated?'
        value={values.motivationStyle || ''}
        onChange={(e) => setField('motivationStyle', e.target.value)}
      >
        <MenuItem value=''>Select</MenuItem>
        <MenuItem value='encouragement'>Encouragement</MenuItem>
        <MenuItem value='accountability'>Accountability</MenuItem>
        <MenuItem value='tough_love'>Tough love</MenuItem>
        <MenuItem value='education'>Education</MenuItem>
        <MenuItem value='structure'>Structure</MenuItem>
      </TextField>

      <TextField
        select
        fullWidth
        label='Would you like to learn more about making extra income?'
        value={values.interestedInExtraIncome || ''}
        onChange={(e) =>
          setField(
            'interestedInExtraIncome',
            e.target.value as InvitationFormValues['interestedInExtraIncome']
          )
        }
      >
        <MenuItem value=''>Select</MenuItem>
        <MenuItem value='yes'>Yes</MenuItem>
        <MenuItem value='no'>No</MenuItem>
      </TextField>
    </Stack>
  );
};

export default MotivationStep;
