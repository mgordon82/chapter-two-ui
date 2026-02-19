import type { ActivityLevel } from '../types/activityLevel';

export const getActivityMultiplier = (
  activityLevel: ActivityLevel | null
): number | null => {
  if (!activityLevel) return null;

  switch (activityLevel) {
    case 'sedentary':
      return 1.2;
    case 'lightly_active':
      return 1.375;
    case 'moderately_active':
      return 1.55;
    case 'very_active':
      return 1.725;
    case 'extremely_active':
      return 1.9;
    default:
      return null;
  }
};

export const calcTdee = (
  bmr: number | null,
  activityLevel: ActivityLevel | null
): number | null => {
  if (bmr == null) return null;

  const multiplier = getActivityMultiplier(activityLevel);
  if (multiplier == null) return null;

  return Math.round(bmr * multiplier);
};
