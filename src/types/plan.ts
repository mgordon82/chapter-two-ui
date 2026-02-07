import { z } from 'zod';

/**
 * Shared macro totals shape
 */
export const macroTotalsSchema = z.object({
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0)
});

/**
 * Allowed meal types
 */
export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);

/**
 * Single meal item
 */
export const mealItemSchema = z.object({
  name: z.string(),
  mealType: mealTypeSchema,
  description: z.string(),
  portionGuidance: z.string(),
  estimatedMacros: macroTotalsSchema,
  swapOptions: z.array(z.string()).default([])
});

/**
 * Full plan data returned from the API
 */
export const planDataSchema = z.object({
  assumptions: z.object({
    mealsPerDay: z.number().int().min(1).max(8),
    notes: z.string()
  }),
  dailyTargets: macroTotalsSchema,
  meals: z.array(mealItemSchema).min(1),
  notes: z.string()
});

/**
 * TypeScript types inferred from schemas
 */
export type MacroTotals = z.infer<typeof macroTotalsSchema>;
export type MealType = z.infer<typeof mealTypeSchema>;
export type MealItem = z.infer<typeof mealItemSchema>;
export type PlanData = z.infer<typeof planDataSchema>;
