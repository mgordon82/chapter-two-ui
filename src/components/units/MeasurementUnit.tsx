import React from 'react';
import { Switch, Typography, Box } from '@mui/material';

export type MeasurementUnit = 'cm' | 'ft';

interface MeasurementUnitSwitchProps {
  value: MeasurementUnit;
  onChange: (unit: MeasurementUnit) => void;
}

const MeasurementUnitSwitch: React.FC<MeasurementUnitSwitchProps> = ({
  value,
  onChange
}) => {
  const isImperial = value === 'ft';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked ? 'ft' : 'cm');
  };

  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Typography variant='body2'>cm</Typography>

      <Switch
        checked={isImperial}
        onChange={handleChange}
        sx={{
          m: 0,
          mx: '-10px',
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: 'grey.600'
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: 'grey.400',
            opacity: 1
          }
        }}
      />

      <Typography variant='body2'>ft/in</Typography>
    </Box>
  );
};

export default MeasurementUnitSwitch;
