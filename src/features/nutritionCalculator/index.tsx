import { useEffect, useMemo, useRef } from 'react';

import { calcWeightGoal } from './calculations/weightGoal';
import { calcBmr } from './calculations/bmr';
import { calcTdee } from './calculations/tdee';

import { Box, Button, Divider, Stack, Typography } from '@mui/material';

import ProfileDetails from './components/ProfileDetails';
import { CoachCalculatedValuesPanel } from './components/CoachCalculatedValuesPanel';

import { useClientProfileForm } from './hooks/useClientProfileForm';
import { useDispatch } from 'react-redux';
import {
  persistUserProfileRequested,
  saveNutritionProfile,
  type UserProfileUpsertPayload,
  selectIsSavingRemote,
  selectLoadedUserProfile,
  selectRemoteError,
  selectRemoteSavedAt,
  selectUserUnitPrefs
} from './redux/nutritionCalculatorSlice';
import { calculateMacros, type MacroResult } from './calculations/dailyMacros';
import { calculateDailyCalorieTarget } from './calculations/dailyCalorieTarget';
import { useAppSelector } from '../../app/hooks';
import { createCheckInRequested } from '../checkIns/redux/checkInsSlice';
import type { FormState } from './types/formState';
import StarterPhotosSection from '../photos/components/StarterPhotosSection';
import ChangePasswordSection from '../account/components/ChangePasswordSection';
import {
  litersToMl,
  mlToLiters,
  mlToOz,
  ozToMl
} from '../../utils/conversions/volume';
import WeighInsPanel from '../checkIns/components/WeighInsPanel';

const KG_TO_LBS = 2.2046226218;
const CM_PER_INCH = 2.54;

const buildHydratedForm = (
  loadedProfile: NonNullable<ReturnType<typeof selectLoadedUserProfile>>,
  unitPrefs: ReturnType<typeof selectUserUnitPrefs>
): FormState => {
  const p = loadedProfile.profile;
  const { measurementUnitPref, weightUnitPref, volumeUnitPref } = unitPrefs;

  let weight = '';
  let startingWeight = '';
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

  if (p.startingWeightKg != null) {
    startingWeight =
      weightUnitPref === 'lbs'
        ? String(Math.round(p.startingWeightKg * KG_TO_LBS))
        : String(p.startingWeightKg);
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
    startingWeight,
    startingWeightKg:
      p.startingWeightKg != null ? String(p.startingWeightKg) : '',
    goalWeightKg: p.goalWeightKg != null ? String(p.goalWeightKg) : '',
    stepGoalDaily: p.stepGoalDaily != null ? String(p.stepGoalDaily) : '',
    waterGoalDailyDisplay:
      p.waterGoalDailyMl != null
        ? volumeUnitPref === 'oz'
          ? String(mlToOz(p.waterGoalDailyMl).toFixed(0))
          : String(mlToLiters(p.waterGoalDailyMl).toFixed(1))
        : '',
    measurementUnitPref,
    weightUnitPref,
    volumeUnitPref
  };
};

const ClientNutritionCalculator = () => {
  const dispatch = useDispatch();

  const hydratedKeyRef = useRef<string | null>(null);

  const loadedProfile = useAppSelector(selectLoadedUserProfile);
  const unitPrefs = useAppSelector(selectUserUnitPrefs);
  const isSavingRemote = useAppSelector(selectIsSavingRemote);
  const remoteError = useAppSelector(selectRemoteError);
  const remoteSavedAt = useAppSelector(selectRemoteSavedAt);
  const checkInsCount = useAppSelector((s) => s.checkIns.items.length);

  const {
    form,
    setField,
    replaceForm,
    clear,
    handleWeightDisplayChange,
    handleStartingWeightDisplayChange,
    handleGoalWeightDisplayChange,
    handleHeightCmChange,
    handleHeightFeetChange,
    handleHeightInchesChange,
    handleMeasurementUnitPrefChange,
    handleWeightUnitPrefChange,
    handleVolumeUnitPrefChange
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
      startingWeightKg: form.startingWeightKg
        ? Number(form.startingWeightKg)
        : null,
      goalWeightKg: form.goalWeightKg ? Number(form.goalWeightKg) : null,
      stepGoalDaily: form.stepGoalDaily ? Number(form.stepGoalDaily) : null,
      waterGoalDailyMl: form.waterGoalDailyDisplay
        ? Math.round(
            form.volumeUnitPref === 'oz'
              ? ozToMl(Number(form.waterGoalDailyDisplay))
              : litersToMl(Number(form.waterGoalDailyDisplay))
          )
        : null,
      age: form.age ? Number(form.age) : null
    };
  }, [form]);

  const weightGoal = useMemo(() => {
    return calcWeightGoal(inputs.weightKg, inputs.goalWeightKg);
  }, [inputs.weightKg, inputs.goalWeightKg]);

  const weightGoalLabel = useMemo(() => {
    if (weightGoal.amountKg == null || weightGoal.direction == null) {
      return null;
    }

    if (weightGoal.direction === 'maintain') {
      if (inputs.goalWeightKg == null) return 'Maintain current weight';

      if (form.weightUnitPref === 'lbs') {
        return `Maintain ${Math.round(inputs.goalWeightKg * KG_TO_LBS)} lbs`;
      }

      return `Maintain ${inputs.goalWeightKg} kg`;
    }

    if (form.weightUnitPref === 'lbs') {
      return `${weightGoal.direction === 'lose' ? 'Lose' : 'Gain'} ${Math.round(
        weightGoal.amountKg * KG_TO_LBS
      )} lbs`;
    }

    return `${weightGoal.direction === 'lose' ? 'Lose' : 'Gain'} ${
      weightGoal.amountKg
    } kg`;
  }, [
    weightGoal.amountKg,
    weightGoal.direction,
    form.weightUnitPref,
    inputs.goalWeightKg
  ]);

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

  const isSaveDisabled = useMemo(() => {
    return (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.gender ||
      !form.activityLevel ||
      !form.goal ||
      !form.rateLevel ||
      !form.age ||
      !form.heightCm ||
      !form.weightKg ||
      !form.goalWeightKg ||
      !macros
    );
  }, [
    form.firstName,
    form.lastName,
    form.gender,
    form.activityLevel,
    form.goal,
    form.rateLevel,
    form.age,
    form.heightCm,
    form.weightKg,
    form.goalWeightKg,
    macros
  ]);

  const handleSave = () => {
    const reduxPayload = {
      inputs,
      calculated: { bmr, tdee, weightGoal },
      macros,
      preferences: {
        measurementUnitPref: form.measurementUnitPref,
        weightUnitPref: form.weightUnitPref,
        volumeUnitPref: form.volumeUnitPref
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
        startingWeightKg: inputs.startingWeightKg,
        stepGoalDaily: inputs.stepGoalDaily,
        waterGoalDailyMl: inputs.waterGoalDailyMl,
        activityLevel: inputs.activityLevel,
        goal: inputs.goal,
        rateLevel: inputs.rateLevel,
        preferences: {
          measurementUnitPref: form.measurementUnitPref,
          weightUnitPref: form.weightUnitPref,
          volumeUnitPref: form.volumeUnitPref
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
      const now = new Date();

      dispatch(
        createCheckInRequested({
          representedDate: now.toISOString().slice(0, 10),
          recordedAt: now.toISOString(),
          weightKg: Number(inputs.weightKg.toFixed(2)),
          notes: 'Starting weight'
        })
      );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
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
              handleStartingWeightDisplayChange,
              handleGoalWeightDisplayChange,
              handleHeightCmChange,
              handleHeightFeetChange,
              handleHeightInchesChange,
              handleMeasurementUnitPrefChange,
              handleWeightUnitPrefChange,
              handleVolumeUnitPrefChange
            }}
          />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent='space-between'
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mt: 2 }}
          >
            <Box sx={{ minHeight: 24, display: 'flex', alignItems: 'center' }}>
              {remoteError ? (
                <Typography
                  variant='body2'
                  sx={{ color: 'error.main', fontWeight: 500 }}
                >
                  {remoteError}
                </Typography>
              ) : remoteSavedAt ? (
                <Typography
                  variant='body2'
                  sx={{ color: 'success.main', fontWeight: 500 }}
                >
                  Profile saved successfully
                </Typography>
              ) : null}
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <Button
                variant='outlined'
                onClick={clear}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Clear
              </Button>

              <Button
                disabled={isSaveDisabled || isSavingRemote}
                variant='contained'
                onClick={handleSave}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {isSavingRemote ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ width: { xs: '100%', md: 380 }, flexShrink: 0 }}>
          <CoachCalculatedValuesPanel
            weightGoalLabel={weightGoalLabel}
            bmr={bmr}
            tdee={tdee}
            macros={macros}
          />
        </Box>
      </Stack>

      <Stack spacing={3}>
        <StarterPhotosSection />
        <WeighInsPanel />
        <Divider sx={{ my: 1 }} />
        <ChangePasswordSection />
      </Stack>
    </Box>
  );
};

export default ClientNutritionCalculator;
