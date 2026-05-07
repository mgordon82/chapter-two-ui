import { MenuItem, Stack, TextField } from '@mui/material';
import type { InvitationFormValues } from '../../types';

type NutritionStepProps = {
  values: InvitationFormValues;
  setField: <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => void;
};

const NutritionStep = ({ values, setField }: NutritionStepProps) => {
  const showApproachDetails = values.followedNutritionApproach === 'yes';

  return (
    <Stack spacing={3}>
      <TextField
        select
        fullWidth
        label='Have you followed a nutrition approach before?'
        value={values.followedNutritionApproach || ''}
        onChange={(e) =>
          setField(
            'followedNutritionApproach',
            e.target.value as InvitationFormValues['followedNutritionApproach']
          )
        }
      >
        <MenuItem value=''>Select</MenuItem>
        <MenuItem value='yes'>Yes</MenuItem>
        <MenuItem value='no'>No</MenuItem>
      </TextField>

      {showApproachDetails && (
        <TextField
          fullWidth
          multiline
          minRows={3}
          label='What was it?'
          value={values.nutritionApproachDetails || ''}
          onChange={(e) => setField('nutritionApproachDetails', e.target.value)}
        />
      )}

      <TextField
        fullWidth
        multiline
        minRows={3}
        label='What does your perfect nutrition look like?'
        value={values.perfectNutrition || ''}
        onChange={(e) => setField('perfectNutrition', e.target.value)}
      />

      <TextField
        fullWidth
        multiline
        minRows={2}
        label='What are your favorite foods?'
        value={values.favoriteFoods || ''}
        onChange={(e) => setField('favoriteFoods', e.target.value)}
      />

      <TextField
        fullWidth
        multiline
        minRows={2}
        label='What are your least favorite foods?'
        value={values.leastFavoriteFoods || ''}
        onChange={(e) => setField('leastFavoriteFoods', e.target.value)}
      />
    </Stack>
  );
};

export default NutritionStep;
