import { round } from '../../../utils/calculations/helpers';

export interface MacroResult {
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export const calculateMacros = (
  dailyCalories: number,
  bodyWeight: number
): MacroResult => {
  const protein = round(bodyWeight * 2.2);
  const carbs = round(dailyCalories / 2 / 4);
  const fat = round((dailyCalories - protein * 4 - carbs * 4) / 9);

  return {
    protein,
    carbs,
    fat
  };
};
