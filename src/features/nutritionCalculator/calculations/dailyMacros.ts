// import { round } from '../../../utils/calculations/helpers';

export interface MacroResult {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export const calculateMacros = (
  dailyCalories: number,
  bodyWeight: number
): MacroResult => {
  const protein = Math.round(bodyWeight * 2.2);
  const carbs = Math.round(dailyCalories / 2 / 4);
  const fat = Math.round((dailyCalories - protein * 4 - carbs * 4) / 9);

  return {
    calories: dailyCalories,
    protein,
    carbs,
    fat
  };
};
