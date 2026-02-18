import React from 'react';
import { Switch, Typography, Box } from '@mui/material';

export type WeightUnit = 'kg' | 'lbs';

interface WeightUnitSwitchProps {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
}

const WeightUnitSwitch: React.FC<WeightUnitSwitchProps> = ({
  value,
  onChange
}) => {
  const isImperial = value === 'lbs';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked ? 'lbs' : 'kg');
  };

  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Typography variant='body2'>kg</Typography>

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

      <Typography variant='body2'>lbs</Typography>
    </Box>
  );
};

export default WeightUnitSwitch;
