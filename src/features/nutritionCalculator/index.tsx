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
  persistUserProfileRequested,
  saveNutritionProfile,
  type UserProfileUpsertPayload,
  selectLoadedUserProfile,
  selectUserUnitPrefs
} from './redux/nutritionCalculatorSlice';
import { calculateMacros, type MacroResult } from './calculations/dailyMacros';
import { calculateDailyCalorieTarget } from './calculations/dailyCalorieTarget';
import { useAppSelector } from '../../app/hooks';
import CheckInsPanel from '../checkIns';
import { createCheckInRequested } from '../checkIns/redux/checkInsSlice';
import type { FormState } from './types/formState';

const KG_TO_LBS = 2.2046226218;
const CM_PER_INCH = 2.54;

const buildHydratedForm = (
  loadedProfile: NonNullable<ReturnType<typeof selectLoadedUserProfile>>,
  unitPrefs: ReturnType<typeof selectUserUnitPrefs>
): FormState => {
  const p = loadedProfile.profile;
  const { measurementUnitPref, weightUnitPref } = unitPrefs;

  let weight = '';
  let goalWeight = '';
  const heightCm = p.heightCm != null ? String(p.heightCm) : '';
  let heightFeet = '';
  let heightInches = '';

  if (p.weightKg != null) {
    weight =
      weightUnitPref === 'lbs'
        ? String(Math.round(p.weightKg * KG_TO_LBS))
        : String(p.weightKg);
  }

  if (p.goalWeightKg != null) {
    goalWeight =
      weightUnitPref === 'lbs'
        ? String(Math.round(p.goalWeightKg * KG_TO_LBS))
        : String(p.goalWeightKg);
  }

  if (p.heightCm != null && measurementUnitPref === 'ft') {
    const totalIn = p.heightCm / CM_PER_INCH;
    const feet = Math.floor(totalIn / 12);
    const inches = Math.round(totalIn - feet * 12);
    heightFeet = String(feet);
    heightInches = String(inches);
  }

  return {
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    gender: p.gender ?? '',
    activityLevel: p.activityLevel ?? '',
    goal: p.goal ?? '',
    rateLevel: p.rateLevel ?? '',
    age: p.age != null ? String(p.age) : '',
    heightCm,
    heightFeet,
    heightInches,
    weight,
    weightKg: p.weightKg != null ? String(p.weightKg) : '',
    goalWeight,
    goalWeightKg: p.goalWeightKg != null ? String(p.goalWeightKg) : '',
    measurementUnitPref,
    weightUnitPref
  };
};

const ClientNutritionCalculator = () => {
  const dispatch = useDispatch();

  const hydratedKeyRef = useRef<string | null>(null);

  const loadedProfile = useAppSelector(selectLoadedUserProfile);
  const unitPrefs = useAppSelector(selectUserUnitPrefs);
  const checkInsCount = useAppSelector((s) => s.checkIns.items.length);

  const {
    form,
    setField,
    replaceForm,
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
    if (!loadedProfile) {
      hydratedKeyRef.current = null;
      return;
    }

    const hydrationKey = JSON.stringify({
      profile: loadedProfile.profile,
      measurementUnitPref: unitPrefs.measurementUnitPref,
      weightUnitPref: unitPrefs.weightUnitPref
    });

    if (hydratedKeyRef.current === hydrationKey) return;

    replaceForm(buildHydratedForm(loadedProfile, unitPrefs));
    hydratedKeyRef.current = hydrationKey;
  }, [loadedProfile, unitPrefs, replaceForm]);

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
    tdee != null && inputs.goal
      ? calculateDailyCalorieTarget(tdee, inputs.goal)
      : null;

  let macros: MacroResult | null = null;

  if (
    dailyCalorieTarget != null &&
    inputs.weightKg != null &&
    inputs.gender != null
  ) {
    const gender: 'male' | 'female' =
      inputs.gender.toLowerCase() === 'male' ? 'male' : 'female';
    macros = calculateMacros(dailyCalorieTarget, inputs.weightKg, gender);
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

    if (checkInsCount === 0 && inputs.weightKg != null) {
      dispatch(
        createCheckInRequested({
          recordedAt: new Date().toISOString(),
          weightKg: Number(inputs.weightKg.toFixed(2)),
          notes: 'Starting weight'
        })
      );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography component='h2' variant='h5' sx={{ mb: 2 }}>
        Client Nutrition Profile
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems='stretch'
        justifyContent='space-between'
        gap={{ xs: 2, md: 3 }}
        mb={3}
      >
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

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent='flex-end'
            sx={{ mt: 2 }}
          >
            <Button
              variant='outlined'
              onClick={clear}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Clear
            </Button>

            <Button
              variant='contained'
              onClick={handleSave}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Save
            </Button>
          </Stack>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 380 }, flexShrink: 0 }}>
          <CoachCalculatedValuesPanel
            weightGoalLabel={weightGoal.label}
            bmr={bmr}
            tdee={tdee}
            macros={macros}
          />
        </Box>
      </Stack>

      <CheckInsPanel />
    </Box>
  );
};

export default ClientNutritionCalculator;
