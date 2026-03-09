import { round } from '../../../utils/calculations/helpers';

export type WeightGoalResult = {
  amountKg: number | null;
  direction: 'lose' | 'gain' | 'maintain' | null;
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
      direction: null
    };
  }

  const diff = round(currentWeightKg - goalWeightKg, 2);

  if (diff === 0) {
    return {
      amountKg: 0,
      direction: 'maintain'
    };
  }

  return {
    amountKg: Math.abs(diff),
    direction: diff > 0 ? 'lose' : 'gain'
  };
};
