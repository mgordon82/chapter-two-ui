import { MenuItem, Stack, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { InvitationFormValues } from '../../types';

type BasicInfoStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const BasicInfoStep = ({ values, setField }: BasicInfoStepProps) => {
  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          fullWidth
          label='First Name'
          value={values.firstName || ''}
          onChange={(e) => setField('firstName', e.target.value)}
        />

        <TextField
          fullWidth
          label='Last Name'
          value={values.lastName || ''}
          onChange={(e) => setField('lastName', e.target.value)}
        />
      </Stack>

      <DatePicker
        label='Date of Birth'
        value={values.dateOfBirth ? dayjs(values.dateOfBirth) : null}
        onChange={(newValue) => {
          setField(
            'dateOfBirth',
            newValue ? newValue.format('YYYY-MM-DD') : ''
          );
        }}
        slotProps={{
          textField: {
            fullWidth: true
          }
        }}
      />

      <TextField
        select
        fullWidth
        label='Preferred Pronouns'
        value={values.pronouns || ''}
        onChange={(e) =>
          setField(
            'pronouns',
            e.target.value as InvitationFormValues['pronouns']
          )
        }
      >
        <MenuItem value=''>Select pronouns</MenuItem>
        <MenuItem value='he_him'>He / Him</MenuItem>
        <MenuItem value='she_her'>She / Her</MenuItem>
        <MenuItem value='they_them'>They / Them</MenuItem>
        <MenuItem value='prefer_not_to_say'>Prefer not to say</MenuItem>
        <MenuItem value='other'>Other</MenuItem>
      </TextField>
    </Stack>
  );
};

export default BasicInfoStep;
