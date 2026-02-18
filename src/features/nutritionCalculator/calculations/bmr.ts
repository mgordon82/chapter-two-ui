import type { Gender } from '../types/gender';
import { round } from '../../../utils/calculations/helpers';

export type BmrInputs = {
  gender: Gender | null;
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
};

export const calcBmr = ({
  gender,
  weightKg,
  heightCm,
  age
}: BmrInputs): number | null => {
  if (
    !gender ||
    weightKg == null ||
    heightCm == null ||
    age == null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    !Number.isFinite(age)
  ) {
    return null;
  }

  if (gender === 'other') return null;

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  const bmr = gender === 'male' ? 5 + base : -161 + base;

  return round(bmr);
};
