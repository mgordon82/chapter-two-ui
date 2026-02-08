export const mockPlan = {
  assumptions: {
    mealsPerDay: 4,
    notes:
      'Assumed no dairy. 4 meals/day. Target: 2500 kcal, ~150 g protein. All sources are dairy-free. Portions and macros are approximate; adjust to taste and schedule.'
  },
  dailyTargets: {
    calories: 2500,
    protein: 150,
    carbs: 285,
    fat: 85
  },
  meals: [
    {
      name: 'Breakfast: Egg & quinoa power bowl with toast',
      mealType: 'breakfast',
      description:
        '4 large eggs scrambled with spinach and peppers, 1 cup cooked quinoa, and 4 slices dairy-free whole-grain toast.',
      portionGuidance: 'About 700 kcal; ~44 g protein; ~87 g carbs; ~29 g fat.',
      estimatedMacros: {
        calories: 700,
        protein: 44,
        carbs: 87,
        fat: 29
      },
      swapOptions: [
        'Add 1/2 avocado to increase fat (~11 g) and calories (~120 kcal).',
        'Swap 2 slices of toast for 1 large bagel to boost carbs.',
        'Use 5 eggs instead of 4 to increase protein by ~6 g and fat by ~4 g.'
      ]
    },
    {
      name: 'Lunch: Herb-roasted chicken with brown rice and vegetables',
      mealType: 'lunch',
      description:
        '5 oz chicken breast, 2 cups cooked brown rice, mixed veggies, with a drizzle of olive oil.',
      portionGuidance:
        'About 700 kcal; ~52 g protein; ~90 g carbs; ~5-7 g fat.',
      estimatedMacros: {
        calories: 703,
        protein: 52,
        carbs: 90,
        fat: 7
      },
      swapOptions: [
        'Swap chicken for turkey or tofu to vary protein.',
        'Swap brown rice for quinoa or potatoes to adjust carbs.',
        'Add 1/2 avocado or 1 tablespoon olive oil to boost fats.'
      ]
    },
    {
      name: 'Dinner: Salmon with quinoa and roasted potato',
      mealType: 'dinner',
      description:
        '6 oz salmon, 1 cup cooked quinoa, 1 medium roasted potato, broccoli, with olive oil drizzle.',
      portionGuidance: 'About 750 kcal; ~46 g protein; ~76 g carbs; ~23 g fat.',
      estimatedMacros: {
        calories: 719,
        protein: 46,
        carbs: 76,
        fat: 23
      },
      swapOptions: [
        'Swap salmon for tuna or chicken to vary fat/protein.',
        'Increase quinoa or add another starch (e.g., extra potato) to raise carbs.',
        'Add 1/2 avocado or 1 tablespoon olive oil to dinner to increase fat.'
      ]
    },
    {
      name: 'Snack: Plant-based protein shake with banana and almonds',
      mealType: 'snack',
      description:
        'Dairy-free protein shake (plant-based powder) + 1 medium banana + 1 oz almonds.',
      portionGuidance: 'About 390 kcal; ~32 g protein; ~36 g carbs; ~14 g fat.',
      estimatedMacros: {
        calories: 389,
        protein: 32,
        carbs: 36,
        fat: 14
      },
      swapOptions: [
        'Swap almonds for other nuts to change fat composition.',
        'Use berries instead of banana to reduce carbs.',
        'Add an extra scoop of plant protein powder to boost protein.'
      ]
    }
  ],
  notes:
    'All meals are dairy-free. Macros are approximate. Adjust portions to meet exact calorie target and taste preferences.'
};
