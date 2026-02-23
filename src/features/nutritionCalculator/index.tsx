import { useEffect, useMemo, useRef } from 'react';

import { calcWeightGoal } from './calculations/weightGoal';
import { calcBmr } from './calculations/bmr';
import { calcTdee } from './calculations/tdee';

import { Box, Button, Stack, Typography } from '@mui/material';

import ProfileDetails from './components/ProfileDetails';
import { CoachCalculatedValuesPanel } from './components/CoachCalculatedValuesPanel';

import { useClientProfileForm } from './hooks/useClientProfileForm';
import { useDispatch } from 'react-redux';
import {
  loadUserProfileRequested,
  persistUserProfileRequested,
  saveNutritionProfile,
  type UserProfileUpsertPayload
} from './redux/nutritionCalculatorSlice';
import { calculateMacros, type MacroResult } from './calculations/dailyMacros';
import { calculateDailyCalorieTarget } from './calculations/dailyCalorieTarget';
import { useAppSelector } from '../../app/hooks';

const ClientNutritionCalculator = () => {
  const dispatch = useDispatch();
  const hydratedRef = useRef(false);
  const loadedProfile = useAppSelector(
    (s) => s.nutritionCalculator.loadedProfile
  );

  useEffect(() => {
    dispatch(loadUserProfileRequested());
  }, [dispatch]);

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

  useEffect(() => {
    if (!loadedProfile) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const p = loadedProfile.profile;

    handleMeasurementUnitPrefChange(p.preferences.measurementUnitPref);
    handleWeightUnitPrefChange(p.preferences.weightUnitPref);

    setField('firstName', p.firstName ?? '');
    setField('lastName', p.lastName ?? '');
    setField('gender', p.gender ?? '');
    setField('activityLevel', p.activityLevel ?? '');
    setField('goal', p.goal ?? '');
    setField('rateLevel', p.rateLevel ?? '');
    setField('age', p.age != null ? String(p.age) : '');

    if (p.weightKg != null) {
      if (p.preferences.weightUnitPref === 'lbs') {
        const lbs = p.weightKg * 2.2046226218;
        handleWeightDisplayChange(String(Math.round(lbs)));
      } else {
        handleWeightDisplayChange(String(p.weightKg));
      }
    }

    if (p.goalWeightKg != null) {
      if (p.preferences.weightUnitPref === 'lbs') {
        const lbs = p.goalWeightKg * 2.2046226218;
        handleGoalWeightDisplayChange(String(Math.round(lbs)));
      } else {
        handleGoalWeightDisplayChange(String(p.goalWeightKg));
      }
    }

    if (p.heightCm != null) {
      if (p.preferences.measurementUnitPref === 'ft') {
        const totalIn = p.heightCm / 2.54;
        const feet = Math.floor(totalIn / 12);
        const inches = Math.round(totalIn - feet * 12);

        handleHeightFeetChange(String(feet));
        handleHeightInchesChange(String(inches));
      } else {
        handleHeightCmChange(String(p.heightCm));
      }
    }

    // 4) CRITICAL: stamp canonical metric fields LAST so calculations + save work
    setField('heightCm', p.heightCm != null ? String(p.heightCm) : '');
    setField('weightKg', p.weightKg != null ? String(p.weightKg) : '');
    setField(
      'goalWeightKg',
      p.goalWeightKg != null ? String(p.goalWeightKg) : ''
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedProfile]);

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
    const reduxPayload = {
      inputs,
      calculated: { bmr, tdee, weightGoal },
      macros,
      preferences: {
        measurementUnitPref: form.measurementUnitPref,
        weightUnitPref: form.weightUnitPref
      }
    };

    dispatch(saveNutritionProfile(reduxPayload));

    if (!macros) {
      return;
    }

    const apiPayload: UserProfileUpsertPayload = {
      profile: {
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        gender: inputs.gender,
        age: inputs.age,
        heightCm: inputs.heightCm,
        weightKg: inputs.weightKg,
        goalWeightKg: inputs.goalWeightKg,
        activityLevel: inputs.activityLevel,
        goal: inputs.goal,
        rateLevel: inputs.rateLevel,
        preferences: {
          measurementUnitPref: form.measurementUnitPref,
          weightUnitPref: form.weightUnitPref
        }
      },
      calculated: {
        bmr,
        tdee,
        weightGoal
      },
      nutrition: {
        targets: {
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fats: macros.fat
        }
      }
    };

    dispatch(persistUserProfileRequested(apiPayload));
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
