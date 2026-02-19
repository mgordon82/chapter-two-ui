import { useMemo } from 'react';

import { calcWeightGoal } from './calculations/weightGoal';
import { calcBmr } from './calculations/bmr';
import { calcTdee } from './calculations/tdee';

import { Box, Button, Stack, Typography } from '@mui/material';

import ProfileDetails from './components/ProfileDetails';
import { CoachCalculatedValuesPanel } from './components/CoachCalculatedValuesPanel';

import { useClientProfileForm } from './hooks/useClientProfileForm';
import { useDispatch } from 'react-redux';
import { saveNutritionProfile } from './redux/nutritionCalculatorSlice';
import { calculateMacros, type MacroResult } from './calculations/dailyMacros';
import { calculateDailyCalorieTarget } from './calculations/dailyCalorieTarget';

const ClientNutritionCalculator = () => {
  const dispatch = useDispatch();
  const {
    form,
    setField,
    clear,
    handleWeightDisplayChange,
    handleGoalWeightDisplayChange,
    handleHeightCmChange,
    handleHeightFeetChange,
    handleHeightInchesChange,
    handleMeasurementUnitPrefChange,
    handleWeightUnitPrefChange
  } = useClientProfileForm();

  const inputs = useMemo(() => {
    return {
      gender: form.gender || null,
      activityLevel: form.activityLevel || null,
      goal: form.goal || null,
      rateLevel: form.rateLevel || null,

      heightCm: form.heightCm ? Number(form.heightCm) : null,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
      goalWeightKg: form.goalWeightKg ? Number(form.goalWeightKg) : null,
      age: form.age ? Number(form.age) : null
    };
  }, [form]);

  const weightGoal = useMemo(() => {
    return calcWeightGoal(inputs.weightKg, inputs.goalWeightKg);
  }, [inputs.weightKg, inputs.goalWeightKg]);

  const bmr = useMemo(() => {
    return calcBmr({
      gender: inputs.gender,
      weightKg: inputs.weightKg,
      heightCm: inputs.heightCm,
      age: inputs.age
    });
  }, [inputs.gender, inputs.weightKg, inputs.heightCm, inputs.age]);

  const tdee = useMemo(() => {
    return calcTdee(bmr, inputs.activityLevel);
  }, [bmr, inputs.activityLevel]);

  const dailyCalorieTarget =
    tdee && inputs.goal && calculateDailyCalorieTarget(tdee, inputs.goal);

  let macros: MacroResult | null = null;

  if (dailyCalorieTarget != null && inputs.weightKg != null) {
    macros = calculateMacros(dailyCalorieTarget, inputs.weightKg);
  }

  const handleSave = () => {
    const payload = {
      inputs,
      calculated: {
        bmr,
        tdee,
        weightGoal
      },
      macros,
      preferences: {
        measurementUnitPref: form.measurementUnitPref,
        weightUnitPref: form.weightUnitPref
      }
    };

    console.log('Form Saved:', payload);
    dispatch(saveNutritionProfile(payload));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography component='h2' variant='h5' sx={{ mb: 2 }}>
        Client Nutrition Profile
      </Typography>

      {/* Main layout: column on mobile, row on desktop */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems='stretch'
        justifyContent='space-between'
        gap={{ xs: 2, md: 3 }}
      >
        {/* Left: form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ProfileDetails
            form={form}
            setField={setField}
            actions={{
              clear,
              handleWeightDisplayChange,
              handleGoalWeightDisplayChange,
              handleHeightCmChange,
              handleHeightFeetChange,
              handleHeightInchesChange,
              handleMeasurementUnitPrefChange,
              handleWeightUnitPrefChange
            }}
          />

          {/* Buttons: stacked full-width on mobile, inline on desktop */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent='flex-end'
            sx={{ mt: 2 }}
          >
            <Button
              variant='outlined'
              onClick={clear}
              sx={{
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Clear
            </Button>

            <Button
              variant='contained'
              onClick={handleSave}
              sx={{
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Save
            </Button>
          </Stack>
        </Box>

        {/* Right: results panel */}
        <Box
          sx={{
            width: { xs: '100%', md: 380 },
            flexShrink: 0
          }}
        >
          <CoachCalculatedValuesPanel
            weightGoalLabel={weightGoal.label}
            bmr={bmr}
            tdee={tdee}
            macros={macros}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default ClientNutritionCalculator;
