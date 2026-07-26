import type { IngredientDatabase } from "./ingredients.js";
import {
  NUTRIENT_KEYS,
  zeroNutrients,
  type NutrientKey,
} from "./nutrients.js";
import { per100gScale, toGrams, type MassUnit } from "./units.js";

/** One line of a recipe: an ingredient and how much of it. */
export interface RecipeItem {
  ingredient: string;
  amount: number;
  unit: MassUnit;
}

export interface Recipe {
  name: string;
  items: RecipeItem[];
}

/** Per-ingredient contribution to a single nutrient, sorted largest first. */
export interface NutrientContribution {
  ingredient: string;
  amount: number;
}

/**
 * A commonly cited healthy calcium-to-phosphorus range for adult dogs. NRC
 * centers around ~1.2–1.4:1 and AAFCO caps the ratio at 2:1; 1.0–2.0 is a
 * reasonable "not obviously off" window for a maintenance diet.
 */
export const RECOMMENDED_CA_P_RANGE = { min: 1.0, max: 2.0 } as const;

export type BalanceStatus = "low" | "in-range" | "high" | "unknown";

export interface CalciumPhosphorusAssessment {
  /** Calcium divided by phosphorus, or `null` if phosphorus is zero. */
  ratio: number | null;
  status: BalanceStatus;
  recommended: { min: number; max: number };
}

export interface RecipeAnalysis {
  totals: Record<NutrientKey, number>;
  /** Total weight of the recipe in grams. */
  totalGrams: number;
  /**
   * Calcium-to-phosphorus balance. One of the most important checks in a raw
   * diet, so it gets first-class treatment here rather than being left as a
   * raw number the caller has to interpret.
   */
  calciumPhosphorus: CalciumPhosphorusAssessment;
}

/** Classify a calcium:phosphorus ratio against the recommended range. */
export function assessCalciumPhosphorus(
  ratio: number | null,
): CalciumPhosphorusAssessment {
  const recommended = {
    min: RECOMMENDED_CA_P_RANGE.min,
    max: RECOMMENDED_CA_P_RANGE.max,
  };

  let status: BalanceStatus;
  if (ratio === null) {
    status = "unknown";
  } else if (ratio < recommended.min) {
    status = "low";
  } else if (ratio > recommended.max) {
    status = "high";
  } else {
    status = "in-range";
  }

  return { ratio, status, recommended };
}

/**
 * Aggregate a recipe into total nutrient values.
 *
 * This is the deterministic core of the project: for each item we look up the
 * ingredient, scale its per-100 g values by the entered amount, and sum across
 * the recipe. No estimation, no model in the loop.
 */
export function analyzeRecipe(
  recipe: Recipe,
  db: IngredientDatabase,
): RecipeAnalysis {
  const totals = zeroNutrients();
  let totalGrams = 0;

  for (const item of recipe.items) {
    const ingredient = db.get(item.ingredient);
    const scale = per100gScale(item.amount, item.unit);
    totalGrams += toGrams(item.amount, item.unit);

    for (const key of NUTRIENT_KEYS) {
      totals[key] += ingredient.per100g[key] * scale;
    }
  }

  const ratio =
    totals.phosphorus_mg > 0
      ? totals.calcium_mg / totals.phosphorus_mg
      : null;

  return {
    totals,
    totalGrams,
    calciumPhosphorus: assessCalciumPhosphorus(ratio),
  };
}

/**
 * Rank each ingredient's contribution to a single nutrient. Useful for
 * answering "which ingredient is driving my phosphorus so high?"
 */
export function contributionsTo(
  recipe: Recipe,
  db: IngredientDatabase,
  nutrient: NutrientKey,
): NutrientContribution[] {
  return recipe.items
    .map((item) => {
      const ingredient = db.get(item.ingredient);
      const scale = per100gScale(item.amount, item.unit);
      return {
        ingredient: item.ingredient,
        amount: ingredient.per100g[nutrient] * scale,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
