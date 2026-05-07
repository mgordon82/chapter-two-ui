import {
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField
} from '@mui/material';
import type { InvitationFormValues } from '../../types';

type BodyInfoStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const BodyInfoStep = ({ values, setField }: BodyInfoStepProps) => {
  const useCm = values.heightUnit === 'cm';

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems='center'
      >
        <TextField
          fullWidth
          label='Current Weight'
          value={values.weightValue || ''}
          onChange={(e) => setField('weightValue', e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                {values.weightUnit}
              </InputAdornment>
            )
          }}
        />

        <RadioGroup
          row
          value={values.weightUnit}
          onChange={(e) =>
            setField(
              'weightUnit',
              e.target.value as InvitationFormValues['weightUnit']
            )
          }
        >
          <FormControlLabel value='lbs' control={<Radio />} label='lbs' />
          <FormControlLabel value='kg' control={<Radio />} label='kg' />
        </RadioGroup>
      </Stack>

      <Stack spacing={2}>
        {useCm ? (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems='center'
          >
            <TextField
              fullWidth
              label='Current Height'
              value={values.heightCmValue || ''}
              onChange={(e) => setField('heightCmValue', e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position='end'>cm</InputAdornment>
              }}
            />

            <RadioGroup
              row
              value={values.heightUnit}
              onChange={(e) =>
                setField(
                  'heightUnit',
                  e.target.value as InvitationFormValues['heightUnit']
                )
              }
            >
              <FormControlLabel
                value='ft_in'
                control={<Radio />}
                label='ft / in'
              />
              <FormControlLabel value='cm' control={<Radio />} label='cm' />
            </RadioGroup>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label='Feet'
                value={values.heightFeet || ''}
                onChange={(e) => setField('heightFeet', e.target.value)}
              />

              <TextField
                fullWidth
                label='Inches'
                value={values.heightInches || ''}
                onChange={(e) => setField('heightInches', e.target.value)}
              />
            </Stack>

            <RadioGroup
              row
              value={values.heightUnit}
              onChange={(e) =>
                setField(
                  'heightUnit',
                  e.target.value as InvitationFormValues['heightUnit']
                )
              }
            >
              <FormControlLabel
                value='ft_in'
                control={<Radio />}
                label='ft / in'
              />
              <FormControlLabel value='cm' control={<Radio />} label='cm' />
            </RadioGroup>
          </Stack>
        )}
      </Stack>

      <TextField
        fullWidth
        label='What is your job?'
        value={values.job || ''}
        onChange={(e) => setField('job', e.target.value)}
      />
    </Stack>
  );
};

export default BodyInfoStep;
