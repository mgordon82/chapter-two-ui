import { Box, Typography } from '@mui/material';
import ClientNutritionCalculator from '../../../features/nutritionCalculator';

export default function MyProfilePage() {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography component='h2' variant='h5' sx={{ mb: 2 }}>
        Manage My Profile
      </Typography>
      <ClientNutritionCalculator />
    </Box>
  );
}
