import { kgToLbsRounded } from '../../../utils/conversions/weight';

export interface MacroResult {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

type Gender = 'male' | 'female';

const getFatCap = (calories: number): number | null => {
  if (calories <= 2000) return 35;
  if (calories <= 2200) return 40;
  if (calories <= 2400) return 50;
  if (calories <= 2600) return 57;
  if (calories <= 2800) return 60;
  if (calories <= 3000) return 65;
  if (calories <= 3200) return 68;
  if (calories <= 3400) return 70;
  if (calories <= 3600) return 74;
  if (calories <= 3800) return 80;
  return null;
};

export const calculateMacros = (
  dailyCalories: number,
  bodyWeightKg: number,
  gender: Gender
): MacroResult => {
  const bodyWeightLb = kgToLbsRounded(bodyWeightKg, 2);

  // Baseline: ~1g protein per lb (matches your previous intent better than 2.2)
  const baselineProtein = Math.round(bodyWeightLb);

  // Trainer rules
  const maxProteinByLb = Math.floor(bodyWeightLb * 1.5);
  const hardMaxProtein = 225;
  const genderMinProtein =
    gender === 'male' ? 160 : gender === 'female' ? 120 : 0;

  // Protein: baseline (or male min), but never exceed caps
  let protein = Math.max(baselineProtein, genderMinProtein);
  protein = Math.min(protein, maxProteinByLb, hardMaxProtein);

  // Fat: capped by tier and by what calories allow after protein
  const fatCap = getFatCap(dailyCalories);
  const caloriesAfterProtein = dailyCalories - protein * 4;
  const maxFatByCalories = Math.max(0, Math.floor(caloriesAfterProtein / 9));

  const fat =
    fatCap == null ? maxFatByCalories : Math.min(fatCap, maxFatByCalories);

  // Carbs: remainder
  const remainingCalories = dailyCalories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  return { calories: dailyCalories, protein, carbs, fat };
};
