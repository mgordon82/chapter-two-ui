import { Stack, TextField } from '@mui/material';
import type { InvitationFormValues } from '../../types';

type AddressStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const AddressStep = ({ values, setField }: AddressStepProps) => {
  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label='Address Line 1'
        value={values.addressLine1}
        onChange={(e) => setField('addressLine1', e.target.value)}
      />

      <TextField
        fullWidth
        label='Address Line 2'
        value={values.addressLine2}
        onChange={(e) => setField('addressLine2', e.target.value)}
      />

      <TextField
        fullWidth
        label='City'
        value={values.city}
        onChange={(e) => setField('city', e.target.value)}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label='State'
          value={values.state}
          onChange={(e) => setField('state', e.target.value)}
        />

        <TextField
          fullWidth
          label='Zip'
          value={values.zip}
          onChange={(e) => setField('zip', e.target.value)}
        />
      </Stack>

      <TextField
        fullWidth
        label='Country'
        value={values.country}
        onChange={(e) => setField('country', e.target.value)}
      />
    </Stack>
  );
};

export default AddressStep;
