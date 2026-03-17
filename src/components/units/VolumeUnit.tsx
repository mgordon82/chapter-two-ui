import React from 'react';
import { Switch, Typography, Box } from '@mui/material';

export type VolumeUnit = 'ml' | 'oz';

interface VolumeUnitSwitchProps {
  value: VolumeUnit;
  onChange: (unit: VolumeUnit) => void;
}

const VolumeUnitSwitch: React.FC<VolumeUnitSwitchProps> = ({
  value,
  onChange
}) => {
  const isOz = value === 'oz';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked ? 'oz' : 'ml');
  };

  return (
    <Box display='flex' alignItems='center' gap={1}>
      <Typography variant='body2'>mL</Typography>

      <Switch
        checked={isOz}
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

      <Typography variant='body2'>oz</Typography>
    </Box>
  );
};

export default VolumeUnitSwitch;
