import { useState } from 'react';
import type { FormState } from '../types/formState';
import { initialFormState } from '../types/formState';

import { toNumberOrNaN, round } from '../../../utils/calculations/helpers';
import { lbsToKg, kgToLbs } from '../../../utils/conversions/weight';
import {
  feetInchesToCm,
  cmToFeetInchesRounded
} from '../../../utils/conversions/measurement';
import type { MeasurementUnit } from '../../../components/units/MeasurementUnit';
import type { WeightUnit } from '../../../components/units/WeightUnit';

export const useClientProfileForm = () => {
  const [form, setForm] = useState<FormState>(initialFormState);

  const setField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const clear = () => setForm(initialFormState);

  const handleWeightDisplayChange = (value: string) => {
    setForm((prev) => {
      const next: FormState = { ...prev, weight: value };
      const n = toNumberOrNaN(value);
      if (Number.isNaN(n)) {
        next.weightKg = '';
        return next;
      }
      const kg = prev.weightUnitPref === 'lbs' ? lbsToKg(n) : n;
      next.weightKg = String(round(kg, 2));
      return next;
    });
  };

  const handleGoalWeightDisplayChange = (value: string) => {
    setForm((prev) => {
      const next: FormState = { ...prev, goalWeight: value };
      const n = toNumberOrNaN(value);
      if (Number.isNaN(n)) {
        next.goalWeightKg = '';
        return next;
      }
      const kg = prev.weightUnitPref === 'lbs' ? lbsToKg(n) : n;
      next.goalWeightKg = String(round(kg, 2));
      return next;
    });
  };

  const handleHeightCmChange = (value: string) => setField('heightCm', value);

  const handleHeightFeetChange = (value: string) => {
    setField('heightFeet', value);
    const ft = toNumberOrNaN(value);
    const inch = toNumberOrNaN(form.heightInches);
    if (Number.isNaN(ft) || Number.isNaN(inch)) return setField('heightCm', '');
    setField('heightCm', String(round(feetInchesToCm(ft, inch), 2)));
  };

  const handleHeightInchesChange = (value: string) => {
    setField('heightInches', value);
    const ft = toNumberOrNaN(form.heightFeet);
    const inch = toNumberOrNaN(value);
    if (Number.isNaN(ft) || Number.isNaN(inch)) return setField('heightCm', '');
    setField('heightCm', String(round(feetInchesToCm(ft, inch), 2)));
  };

  const handleMeasurementUnitPrefChange = (unit: MeasurementUnit) => {
    if (unit === form.measurementUnitPref) return;
    setForm((prev) => {
      const next: FormState = { ...prev, measurementUnitPref: unit };
      if (unit === 'ft') {
        const cm = toNumberOrNaN(prev.heightCm);
        if (!Number.isNaN(cm) && cm > 0) {
          const { feet, inches } = cmToFeetInchesRounded(cm);
          next.heightFeet = String(feet);
          next.heightInches = String(inches);
        }
      }
      if (unit === 'cm') {
        const ft = toNumberOrNaN(prev.heightFeet);
        const inch = toNumberOrNaN(prev.heightInches);
        if (prev.heightCm === '' && !Number.isNaN(ft) && !Number.isNaN(inch)) {
          next.heightCm = String(round(feetInchesToCm(ft, inch), 2));
        }
      }
      return next;
    });
  };

  const handleWeightUnitPrefChange = (unit: WeightUnit) => {
    if (unit === form.weightUnitPref) return;
    setForm((prev) => {
      const next: FormState = { ...prev, weightUnitPref: unit };

      const currentKg = toNumberOrNaN(prev.weightKg);
      if (!Number.isNaN(currentKg) && currentKg > 0) {
        next.weight =
          unit === 'lbs'
            ? String(round(kgToLbs(currentKg), 2))
            : String(round(currentKg, 2));
      }

      const goalKg = toNumberOrNaN(prev.goalWeightKg);
      if (!Number.isNaN(goalKg) && goalKg > 0) {
        next.goalWeight =
          unit === 'lbs'
            ? String(round(kgToLbs(goalKg), 2))
            : String(round(goalKg, 2));
      }

      return next;
    });
  };

  return {
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
  };
};
