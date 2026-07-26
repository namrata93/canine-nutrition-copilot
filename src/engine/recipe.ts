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

export interface RecipeAnalysis {
  totals: Record<NutrientKey, number>;
  /** Total weight of the recipe in grams. */
  totalGrams: number;
  /**
   * Calcium-to-phosphorus ratio. This is one of the most important balance
   * checks in a raw diet, which is why it gets first-class treatment here.
   * `null` when there is no phosphorus to divide by.
   */
  calciumPhosphorusRatio: number | null;
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

  const calciumPhosphorusRatio =
    totals.phosphorus_mg > 0
      ? totals.calcium_mg / totals.phosphorus_mg
      : null;

  return { totals, totalGrams, calciumPhosphorusRatio };
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
