import { round } from '../../../utils/calculations/helpers';

export type WeightGoalResult = {
  amountKg: number | null;
  direction: 'lose' | 'gain' | 'maintain' | null;
  label: string | null;
};

export const calcWeightGoal = (
  currentWeightKg: number | null,
  goalWeightKg: number | null
): WeightGoalResult => {
  if (
    currentWeightKg == null ||
    goalWeightKg == null ||
    !Number.isFinite(currentWeightKg) ||
    !Number.isFinite(goalWeightKg)
  ) {
    return {
      amountKg: null,
      direction: null,
      label: null
    };
  }

  const diff = round(currentWeightKg - goalWeightKg, 2);
  const direction = diff > 0 ? 'lose' : 'gain';
  const amountKg = Math.abs(diff);

  if (diff === 0) {
    return {
      amountKg: 0,
      direction: 'maintain',
      label: `Maintain ${currentWeightKg} kg`
    };
  }

  return {
    amountKg,
    direction,
    label: `${direction === 'lose' ? 'Lose' : 'Gain'} ${amountKg} kg`
  };
};
