# Taking apart the Dog Formulator

*First dug into it: July 2026*

This is my working notebook for figuring out how the Dog Formulator actually computes a meal, before I rebuild any of it in code. My goal here isn't to copy the spreadsheet — it's to understand the underlying nutrition model well enough that I can implement it cleanly from real data and know it's right. The spreadsheet itself isn't part of this repo; these are just my notes on how the math works.

## The pieces of the model

Underneath all the tabs and formatting, there are really only a few moving parts:

- **An ingredient database.** Nutrient values for each food, stored per 100 g. This is mostly USDA FoodData Central numbers organized for dogs.
- **A calculation layer.** For each ingredient in a recipe, it converts your amount to a common unit, scales the nutrient values, and adds everything up into recipe totals. This is the biggest and most formula-heavy part.
- **Reference targets.** The NRC, AAFCO, and FEDIAF nutrient requirements, broken out by life stage.
- **A profile + input layer.** Where you describe the dog and enter the recipe, and where the final totals get compared against the targets.
- **Batching and saved recipes.** Scaling a daily recipe up to a week or a month, and storing recipes to reload later.

For a first port, only the first two matter — the ingredient data and the calculation that turns a recipe into numbers. Everything else is input, presentation, or convenience.

## How a recipe becomes numbers

The core loop is simple once you strip away the spreadsheet mechanics:

```text
recipe: [ (ingredient, amount, unit), ... ]
        │
        ▼
for each ingredient:
    look up its per-100 g nutrient values
    convert the amount to a "per 100 g" scale
    multiply
        │
        ▼
sum every nutrient across the recipe
        │
        ▼
compare the totals against the chosen standard's targets
```

That's really the whole engine. Each ingredient contributes `nutrient_per_100g × (amount scaled to 100 g)`, and the recipe total is just the sum of those contributions.

## Unit conversion

Everything hinges on getting amounts onto the same scale before summing. Since the database is per 100 g, each amount gets converted to grams and divided by 100:

- `g` → amount / 100
- `mg` → 0.001 × amount / 100
- `mcg` → 0.000001 × amount / 100
- `oz` → 28.3495 × amount / 100
- `lbs` → 453.592 × amount / 100
- supplement units (`pills/tablets`, `drops`, `tsp`) → used as-is

The mass units I'm confident about — that's plain arithmetic, and it's what the code covers today. The supplement units I don't fully trust yet, because whether they're right depends on how those specific rows are set up, and I haven't traced that all the way through.

## Dog profile and targets (not ported yet)

Before you can say whether a recipe is balanced, you need to know *for which dog*. The model takes the usual inputs — weight, age, breed size, activity level, spayed/neutered, weight-management goal, pregnancy/lactation — and from those works out a life stage and an energy requirement. That energy number, plus the standard you pick, is what selects the actual nutrient targets to measure against.

I haven't broken the calorie/energy formula down into rules I'd trust in code yet — that's deliberately a later job. I want the ingredient math rock-solid first, since everything else builds on it.

## The reference standards

The targets come from three published standards — NRC, AAFCO, and FEDIAF — each with values by life stage. They're expressed on a few different bases (per kg of dry matter, per 1,000 kcal of metabolizable energy, and per kg of body weight^0.75), so part of the work later will be picking the right basis for a given dog and standard. Figuring out exactly which values are authoritative for each combination is still on my list.

## The saved recipes (and why they're useful)

There's one lucky break for testing: I have the same recipe written out twice, once in ounces and once in grams. That's a perfect regression test — after unit conversion, both versions have to land on the same nutrient totals, or my math is wrong.

These recipes are actually mine, ones I've used making meals for my dog, so they double as a real-world sanity check, not just a technical one.

## Where I started the code port

Narrow, on purpose:

1. Load the ingredient data into a typed model.
2. Represent a recipe as a list of (ingredient, amount, unit).
3. Reproduce the conversion and per-nutrient sum.
4. Check the ounce and gram versions of my recipe against each other.
5. *Only then* tackle dog-energy and target selection.

Steps 1–4 are done — that's what's in `src/` — and they pass under test. This gets the most predictable part working and trustworthy before I go near the messier profile logic.

## A caveat on the source file

The copy I'm working from was exported out of Google Sheets, and the export isn't clean: some formulas came across as cached values rather than live formulas, a few rely on Google-only functions, and there are references to a lookup sheet that didn't make it into the export at all.

So the file is great for *understanding* the model, but I can't treat it as a runnable source of truth. Before I trust any number as "correct," I confirm it against the live sheet or capture it as an explicit expected value in a test — which is exactly what the ounce/gram fixture does.

## Open questions for next time

- Which values are authoritative for each standard and life stage?
- How should supplements be handled when the unit is pills, drops, or teaspoons?
- How exactly is the energy requirement calculated across all the profile inputs?
- Which outputs should I capture as regression fixtures before rebuilding more of the model?
