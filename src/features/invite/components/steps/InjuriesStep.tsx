import { MenuItem, Stack, TextField } from '@mui/material';
import type { InvitationFormValues } from '../../types';

type InjuriesStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const InjuriesStep = ({ values, setField }: InjuriesStepProps) => {
  const showDetails = values.hasInjuries === 'yes';

  return (
    <Stack spacing={3}>
      <TextField
        select
        fullWidth
        label='Do you have any injuries?'
        value={values.hasInjuries || ''}
        onChange={(e) =>
          setField(
            'hasInjuries',
            e.target.value as InvitationFormValues['hasInjuries']
          )
        }
      >
        <MenuItem value=''>Select</MenuItem>
        <MenuItem value='yes'>Yes</MenuItem>
        <MenuItem value='no'>No</MenuItem>
      </TextField>

      {showDetails && (
        <TextField
          fullWidth
          multiline
          minRows={3}
          label='What are they?'
          value={values.injuryDetails || ''}
          onChange={(e) => setField('injuryDetails', e.target.value)}
        />
      )}
    </Stack>
  );
};

export default InjuriesStep;
