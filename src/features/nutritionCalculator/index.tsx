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
  persistUserPreferencesRequested,
  saveNutritionProfile,
  type UserProfileUpsertPayload,
  selectLoadedUserProfile,
  selectUserUnitPrefs,
  userPreferencesUpdated
} from './redux/nutritionCalculatorSlice';
import { calculateMacros, type MacroResult } from './calculations/dailyMacros';
import { calculateDailyCalorieTarget } from './calculations/dailyCalorieTarget';
import { useAppSelector } from '../../app/hooks';
import type { MeasurementUnit } from '../../components/units/MeasurementUnit';
import type { WeightUnit } from '../../components/units/WeightUnit';

const KG_TO_LBS = 2.2046226218;
const CM_PER_INCH = 2.54;

const PREFS_DEBOUNCE_MS = 500;

const ClientNutritionCalculator = () => {
  const dispatch = useDispatch();

  // Track whether we've hydrated for the *current* loadedProfile instance
  const hydratedRef = useRef(false);
  const prevProfileRef = useRef<ReturnType<
    typeof selectLoadedUserProfile
  > | null>(null);

  // Avoid persisting prefs during initial hydration
  const suppressPrefsPersistRef = useRef(false);

  // Debounce timer for prefs persistence
  const prefsTimerRef = useRef<number | null>(null);
  const latestPrefsRef = useRef<{
    measurementUnitPref: MeasurementUnit;
    weightUnitPref: WeightUnit;
  } | null>(null);

  const loadedProfile = useAppSelector(selectLoadedUserProfile);
  const unitPrefs = useAppSelector(selectUserUnitPrefs);

  // Keep a ref to latest loadedProfile for guard checks
  const loadedProfileRef = useRef<typeof loadedProfile>(loadedProfile);
  useEffect(() => {
    loadedProfileRef.current = loadedProfile;
  }, [loadedProfile]);

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
  } = useClientProfileForm({
    onPrefsChange: (prefs) => {
      if (suppressPrefsPersistRef.current) return;
      if (!loadedProfileRef.current) return;

      // ✅ optimistic Redux sync
      dispatch(userPreferencesUpdated(prefs));

      latestPrefsRef.current = prefs;

      if (prefsTimerRef.current) {
        window.clearTimeout(prefsTimerRef.current);
      }

      prefsTimerRef.current = window.setTimeout(() => {
        const latest = latestPrefsRef.current;
        if (!latest) return;

        // ✅ Preferences-only action (epic builds the full payload)
        dispatch(persistUserPreferencesRequested(latest));
      }, PREFS_DEBOUNCE_MS);
    }
  });

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (prefsTimerRef.current) {
        window.clearTimeout(prefsTimerRef.current);
      }
    };
  }, []);

  /**
   * Reset hydration flag when loadedProfile changes (logout/login or user switch)
   */
  useEffect(() => {
    const prev = prevProfileRef.current;

    if (loadedProfile === null) {
      hydratedRef.current = false;
      prevProfileRef.current = null;
      return;
    }

    if (prev !== loadedProfile) {
      hydratedRef.current = false;
      prevProfileRef.current = loadedProfile;
    }
  }, [loadedProfile]);

  useEffect(() => {
    if (!loadedProfile) return;
    if (hydratedRef.current) return;

    suppressPrefsPersistRef.current = true;

    const p = loadedProfile.profile;
    const { measurementUnitPref, weightUnitPref } = unitPrefs;

    handleMeasurementUnitPrefChange(measurementUnitPref);
    handleWeightUnitPrefChange(weightUnitPref);

    setField('firstName', p.firstName ?? '');
    setField('lastName', p.lastName ?? '');
    setField('gender', p.gender ?? '');
    setField('activityLevel', p.activityLevel ?? '');
    setField('goal', p.goal ?? '');
    setField('rateLevel', p.rateLevel ?? '');
    setField('age', p.age != null ? String(p.age) : '');

    if (p.weightKg != null) {
      if (weightUnitPref === 'lbs') {
        const lbs = p.weightKg * KG_TO_LBS;
        handleWeightDisplayChange(String(Math.round(lbs)));
      } else {
        handleWeightDisplayChange(String(p.weightKg));
      }
    }

    if (p.goalWeightKg != null) {
      if (weightUnitPref === 'lbs') {
        const lbs = p.goalWeightKg * KG_TO_LBS;
        handleGoalWeightDisplayChange(String(Math.round(lbs)));
      } else {
        handleGoalWeightDisplayChange(String(p.goalWeightKg));
      }
    }

    if (p.heightCm != null) {
      if (measurementUnitPref === 'ft') {
        const totalIn = p.heightCm / CM_PER_INCH;
        const feet = Math.floor(totalIn / 12);
        const inches = Math.round(totalIn - feet * 12);

        handleHeightFeetChange(String(feet));
        handleHeightInchesChange(String(inches));
      } else {
        handleHeightCmChange(String(p.heightCm));
      }
    }

    setField('heightCm', p.heightCm != null ? String(p.heightCm) : '');
    setField('weightKg', p.weightKg != null ? String(p.weightKg) : '');
    setField(
      'goalWeightKg',
      p.goalWeightKg != null ? String(p.goalWeightKg) : ''
    );

    hydratedRef.current = true;
    suppressPrefsPersistRef.current = false;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedProfile, unitPrefs]);

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

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems='stretch'
        justifyContent='space-between'
        gap={{ xs: 2, md: 3 }}
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
    </Box>
  );
};

export default ClientNutritionCalculator;
