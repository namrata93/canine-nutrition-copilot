import { analyzeRecipe, contributionsTo } from "./engine/recipe.js";
import { NUTRIENTS } from "./engine/nutrients.js";
import { ingredientDatabase } from "./data/ingredients.js";
import { sampleRecipeOunces } from "./data/recipes.js";

const recipe = sampleRecipeOunces;
const analysis = analyzeRecipe(recipe, ingredientDatabase);

console.log(`\n${recipe.name}  (${analysis.totalGrams.toFixed(1)} g total)\n`);

for (const [key, meta] of Object.entries(NUTRIENTS)) {
  const value = analysis.totals[key as keyof typeof NUTRIENTS];
  console.log(`  ${meta.label.padEnd(12)} ${value.toFixed(2).padStart(9)} ${meta.unit}`);
}

if (analysis.calciumPhosphorusRatio !== null) {
  console.log(
    `\n  Calcium : Phosphorus  =  ${analysis.calciumPhosphorusRatio.toFixed(2)} : 1`,
  );
}

console.log("\nWhat's driving phosphorus:");
for (const c of contributionsTo(recipe, ingredientDatabase, "phosphorus_mg")) {
  console.log(`  ${c.ingredient.padEnd(40)} ${c.amount.toFixed(1)} mg`);
}
console.log();
