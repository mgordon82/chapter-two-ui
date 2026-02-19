import type { Goal } from '../types/goal';

export function calculateDailyCalorieTarget(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'maintain':
      return tdee;
    case 'muscle_gain':
      return tdee + 200;
    case 'fat_loss':
      return tdee - 300;
    default:
      return tdee;
  }
}
