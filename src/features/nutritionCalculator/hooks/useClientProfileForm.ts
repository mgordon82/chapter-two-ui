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

  const replaceForm = (nextForm: FormState) => {
    setForm(nextForm);
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

  const handleHeightCmChange = (value: string) => {
    setForm((prev) => ({ ...prev, heightCm: value }));
  };

  const handleHeightFeetChange = (value: string) => {
    setForm((prev) => {
      const next: FormState = { ...prev, heightFeet: value };
      const ft = toNumberOrNaN(value);
      const inch = toNumberOrNaN(prev.heightInches);

      if (Number.isNaN(ft) || Number.isNaN(inch)) {
        next.heightCm = '';
        return next;
      }

      next.heightCm = String(round(feetInchesToCm(ft, inch), 2));
      return next;
    });
  };

  const handleHeightInchesChange = (value: string) => {
    setForm((prev) => {
      const next: FormState = { ...prev, heightInches: value };
      const ft = toNumberOrNaN(prev.heightFeet);
      const inch = toNumberOrNaN(value);

      if (Number.isNaN(ft) || Number.isNaN(inch)) {
        next.heightCm = '';
        return next;
      }

      next.heightCm = String(round(feetInchesToCm(ft, inch), 2));
      return next;
    });
  };

  const handleMeasurementUnitPrefChange = (unit: MeasurementUnit) => {
    setForm((prev) => {
      if (unit === prev.measurementUnitPref) return prev;

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
    setForm((prev) => {
      if (unit === prev.weightUnitPref) return prev;

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
    replaceForm,
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
