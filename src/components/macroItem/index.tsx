import { Box, Typography } from '@mui/material';

interface MacroItemProps {
  name: string;
  value: number | string;
  color?: string;
  unit?: string;
}

const MacroItem: React.FC<MacroItemProps> = ({
  name,
  value,
  color = '#111827',
  unit
}) => {
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='flex-start'
      gap={0.25}
    >
      <Typography
        variant='caption'
        sx={{ color: 'text.secondary', textTransform: 'uppercase' }}
      >
        {name}
      </Typography>

      <Typography
        variant='h6'
        sx={{
          fontWeight: 600,
          color
        }}
      >
        {value}
        {unit && (
          <Typography
            component='span'
            variant='body2'
            sx={{ ml: 0.5, color: 'text.secondary' }}
          >
            {unit}
          </Typography>
        )}
      </Typography>
    </Box>
  );
};

export default MacroItem;
