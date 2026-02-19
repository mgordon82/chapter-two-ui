import {
  Box,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField
} from '@mui/material';

import MeasurementUnitSwitch, {
  type MeasurementUnit
} from '../../../components/units/MeasurementUnit';

import WeightUnitSwitch, {
  type WeightUnit
} from '../../../components/units/WeightUnit';

import type { FormState } from '../types/formState';

type ProfileDetailsProps = {
  form: FormState;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  actions: {
    clear: () => void;
    handleWeightDisplayChange: (value: string) => void;
    handleGoalWeightDisplayChange: (value: string) => void;
    handleHeightCmChange: (value: string) => void;
    handleHeightFeetChange: (value: string) => void;
    handleHeightInchesChange: (value: string) => void;
    handleMeasurementUnitPrefChange: (unit: MeasurementUnit) => void;
    handleWeightUnitPrefChange: (unit: WeightUnit) => void;
  };
};

const ProfileDetails = ({ form, setField, actions }: ProfileDetailsProps) => {
  const {
    handleWeightDisplayChange,
    handleGoalWeightDisplayChange,
    handleHeightCmChange,
    handleHeightFeetChange,
    handleHeightInchesChange,
    handleMeasurementUnitPrefChange,
    handleWeightUnitPrefChange
  } = actions;

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setField(field, event.target.value as FormState[typeof field]);
    };

  return (
    <Box>
      {/* Unit Switches */}
      <Stack
        flexGrow={1}
        direction='row'
        gap={3}
        pr={2}
        justifyContent='flex-end'
      >
        <MeasurementUnitSwitch
          value={form.measurementUnitPref}
          onChange={handleMeasurementUnitPrefChange}
        />

        <WeightUnitSwitch
          value={form.weightUnitPref}
          onChange={handleWeightUnitPrefChange}
        />
      </Stack>

      {/* Profile Section */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Stack spacing={3}>
          <Stack direction='row' gap={2}>
            <TextField
              fullWidth
              label='First Name'
              value={form.firstName}
              onChange={handleChange('firstName')}
            />
            <TextField
              fullWidth
              label='Last Name'
              value={form.lastName}
              onChange={handleChange('lastName')}
            />
          </Stack>

          <Stack direction='row' gap={2}>
            <TextField
              select
              fullWidth
              label='Gender'
              value={form.gender}
              onChange={handleChange('gender')}
            >
              <MenuItem value='male'>Male</MenuItem>
              <MenuItem value='female'>Female</MenuItem>
              <MenuItem value='other'>Other</MenuItem>
            </TextField>

            <TextField
              type='number'
              fullWidth
              label='Age'
              value={form.age}
              onChange={handleChange('age')}
              inputProps={{ min: 0 }}
            />
          </Stack>

          <Stack direction='row' gap={2}>
            {form.measurementUnitPref === 'cm' ? (
              <TextField
                type='number'
                fullWidth
                label='Height'
                value={form.heightCm}
                onChange={(e) => handleHeightCmChange(e.target.value)}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>cm</InputAdornment>
                  )
                }}
              />
            ) : (
              <Stack direction='row' spacing={2} width='100%'>
                <TextField
                  type='number'
                  fullWidth
                  label='Feet'
                  value={form.heightFeet}
                  onChange={(e) => handleHeightFeetChange(e.target.value)}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  type='number'
                  fullWidth
                  label='Inches'
                  value={form.heightInches}
                  onChange={(e) => handleHeightInchesChange(e.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Stack>
            )}

            <TextField
              type='number'
              fullWidth
              label='Current Weight'
              value={form.weight}
              onChange={(e) => handleWeightDisplayChange(e.target.value)}
              inputProps={{ min: 0 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {form.weightUnitPref}
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Goal Section */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Stack spacing={3}>
          <Stack direction='row' gap={2}>
            <TextField
              select
              fullWidth
              label='Activity Level'
              value={form.activityLevel}
              onChange={handleChange('activityLevel')}
            >
              <MenuItem value='sedentary'>Sedentary</MenuItem>
              <MenuItem value='lightly_active'>Lightly Active</MenuItem>
              <MenuItem value='moderately_active'>Moderately Active</MenuItem>
              <MenuItem value='very_active'>Very Active</MenuItem>
              <MenuItem value='extremely_active'>Extremely Active</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label='Overall Goal'
              value={form.goal}
              onChange={handleChange('goal')}
            >
              <MenuItem value='muscle_gain'>Muscle Gain</MenuItem>
              <MenuItem value='fat_loss'>Fat Loss</MenuItem>
              <MenuItem value='maintain'>Maintain</MenuItem>
            </TextField>
          </Stack>

          <Stack direction='row' gap={2}>
            <TextField
              type='number'
              fullWidth
              label='Goal Weight'
              value={form.goalWeight}
              onChange={(e) => handleGoalWeightDisplayChange(e.target.value)}
              inputProps={{ min: 0 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {form.weightUnitPref}
                  </InputAdornment>
                )
              }}
            />

            <TextField
              select
              fullWidth
              label='Effort Rate Level'
              value={form.rateLevel}
              onChange={handleChange('rateLevel')}
            >
              <MenuItem value='low'>Low</MenuItem>
              <MenuItem value='moderate'>Moderate</MenuItem>
              <MenuItem value='extreme'>Extreme</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfileDetails;
