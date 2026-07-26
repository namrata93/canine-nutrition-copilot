import { describe, expect, it } from "vitest";
import { analyzeRecipe, type Recipe } from "../src/engine/recipe.js";
import { NUTRIENT_KEYS } from "../src/engine/nutrients.js";
import { toGrams } from "../src/engine/units.js";
import { ingredientDatabase } from "../src/data/ingredients.js";
import {
  sampleRecipeOunces,
  sampleRecipeGrams,
} from "../src/data/recipes.js";

describe("recipe aggregation", () => {
  it("is unit-invariant: an ounce recipe equals its exact gram equivalent", () => {
    // Convert every ounce amount to its exact gram value, then confirm the
    // totals match to floating-point precision. This is the core guarantee:
    // the engine measures mass, not the label on the scale.
    const exactGrams: Recipe = {
      name: "exact grams",
      items: sampleRecipeOunces.items.map((item) => ({
        ingredient: item.ingredient,
        amount: toGrams(item.amount, item.unit),
        unit: "g",
      })),
    };

    const fromOz = analyzeRecipe(sampleRecipeOunces, ingredientDatabase);
    const fromG = analyzeRecipe(exactGrams, ingredientDatabase);

    for (const key of NUTRIENT_KEYS) {
      expect(fromG.totals[key]).toBeCloseTo(fromOz.totals[key], 10);
    }
    expect(fromG.totalGrams).toBeCloseTo(fromOz.totalGrams, 10);
  });

  it("matches the workbook's rounded gram recipe within tolerance", () => {
    // The workbook stores the gram version rounded to one decimal, so the two
    // saved recipes should agree closely but not exactly. Every nutrient should
    // land within 0.5% of the ounce-based result.
    const fromOz = analyzeRecipe(sampleRecipeOunces, ingredientDatabase);
    const fromG = analyzeRecipe(sampleRecipeGrams, ingredientDatabase);

    for (const key of NUTRIENT_KEYS) {
      const expected = fromOz.totals[key];
      const relativeError = Math.abs(fromG.totals[key] - expected) / expected;
      expect(relativeError).toBeLessThan(0.005);
    }
  });

  it("reports a calcium:phosphorus ratio for the sample recipe", () => {
    const analysis = analyzeRecipe(sampleRecipeOunces, ingredientDatabase);
    expect(analysis.calciumPhosphorusRatio).not.toBeNull();
    // Chicken backs are bone-in, so this recipe should be calcium-rich.
    expect(analysis.calciumPhosphorusRatio!).toBeGreaterThan(1);
  });

  it("computes a known-good total for calories", () => {
    // Locks in a concrete expected value so future refactors can't silently
    // change the math. 5.5 oz chicken back + 0.5 oz liver + 1.6 oz kidney.
    const analysis = analyzeRecipe(sampleRecipeOunces, ingredientDatabase);
    expect(analysis.totals.calories_kcal).toBeCloseTo(388.36, 1);
  });
});
