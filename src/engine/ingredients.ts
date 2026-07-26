import type { NutrientKey } from "./nutrients.js";

/**
 * A single ingredient with its nutrient content expressed per 100 g, matching
 * the layout of the workbook's "Food Data" sheet.
 */
export interface Ingredient {
  name: string;
  /** USDA FoodData Central id or other provenance note, for traceability. */
  source?: string;
  per100g: Record<NutrientKey, number>;
}

/** A simple name-keyed ingredient database. */
export class IngredientDatabase {
  private byName = new Map<string, Ingredient>();

  constructor(ingredients: Ingredient[]) {
    for (const ingredient of ingredients) {
      this.byName.set(ingredient.name, ingredient);
    }
  }

  get(name: string): Ingredient {
    const ingredient = this.byName.get(name);
    if (!ingredient) {
      throw new Error(`Unknown ingredient: "${name}"`);
    }
    return ingredient;
  }

  has(name: string): boolean {
    return this.byName.has(name);
  }

  names(): string[] {
    return [...this.byName.keys()];
  }
}
