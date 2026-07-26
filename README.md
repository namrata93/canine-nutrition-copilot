# Canine Nutrition Copilot

I feed my dog a raw diet — muscle meat, organs, bone, and a little fiber — and getting it *actually balanced* is harder than it looks. A few years ago I got certified in canine nutrition, mostly out of love for my dog, and then never really did anything with it. This is me finally doing something with it.

The goal is a tool that helps people build raw and home-prepared meals that meet real nutritional standards, without having to do all the math by hand.

There's a spreadsheet called the **Dog Formulator**, made by [Paws of Prey](https://www.pawsofprey.com/), that lets you assemble a recipe ingredient by ingredient and check it against canine nutrient requirements. It's a genuinely impressive piece of work, and I've always found it fascinating. I usually just buy pre-made raw food, but I do dabble in building meals from scratch now and then (for fun).

I kept coming back to one question: what if you didn't need to understand the spreadsheet to use it? What if you could describe your dog and what you have in the fridge, and get a balanced plan back — with the math shown, not hidden?

This project is my attempt at that. It is **inspired by** the Dog Formulator, not a copy of it, and the original spreadsheet is not distributed here.

One thing I feel strongly about: I don't want an AI guessing at the numbers my dog actually eats. Nutrient totals, unit conversions, and targets are just arithmetic — there's a right answer, and it should come from real data, not a model's best guess.

So the split is:

- A **deterministic engine** owns every calculation — ingredient nutrient lookups, unit conversion, energy requirements, reference-standard targets, and recipe validation.
- The **LLM** is the interface. It turns "my 40 lb dog is getting a little chunky, can I swap beef heart for turkey?" into structured constraints, and turns the engine's output back into a grounded, plain-English explanation.

The AI helps you ask and understand. The math stays with the engine.

```text
Your question or request
        │
        ▼
LLM — parse intent and constraints
        │
        ▼
Deterministic nutrition engine
  ├─ ingredient nutrient data
  ├─ unit conversion
  ├─ energy requirements
  ├─ reference-standard targets
  └─ recipe aggregation + validation
        │
        ▼
Structured results
        │
        ▼
LLM — grounded explanation
```



## What it should eventually do

**Analyze a plan you already have**

- Flag nutrients that are deficient or excessive.
- Show which ingredients drive a given nutrient up or down.
- Answer "what changes if I..." questions.

**Help you build or adjust a plan**

- Turn natural-language preferences into structured constraints.
- Use calculation (and later, optimization) to pick quantities.
- Validate the whole thing before it's ever shown to you.



## Where the project actually is right now

I started by reverse-engineering the spreadsheet's logic, so the engine reproduces a *known-correct* model instead of my best guess. That analysis lives in [docs/workbook-analysis.md](docs/workbook-analysis.md), and `scripts/inspect_workbook.py` inventories the workbook's sheets and formulas.

The first slice of the deterministic engine is now built and tested. It takes a recipe, converts units, and aggregates nutrients the same way the spreadsheet does — including the calcium-to-phosphorus ratio that makes or breaks a raw diet:

```text
Sample recipe (ounces)  (215.5 g total)

  Calories        388.36 kcal
  Protein          34.66 g
  Fat              28.66 g
  Calcium        2080.37 mg
  Phosphorus     1325.25 mg
  ...
  Calcium : Phosphorus  =  1.57 : 1

What's driving phosphorus:
  Raw Chicken Back, Bone, Meat and Skin    1153.8 mg
  Raw Beef Kidney                          116.6 mg
  Raw Beef Liver                           54.9 mg
```

The workbook happens to store the same sample recipe twice — once in ounces, once in grams — so I use that pair as a regression test: after unit conversion, both must describe the same meal. They do.

Done so far:

- [x] Reverse-engineered the workbook's sheets, calculation flow, and export quirks.
- [x] Extracted a typed ingredient dataset and the sample recipe fixtures from the workbook.
- [x] Built the deterministic engine: unit conversion + per-nutrient aggregation + Ca:P ratio.
- [x] Proved unit-invariance (ounces vs. grams) and matched the workbook's saved totals, under test.

Next:

- [ ] Generate the full ingredient database from the workbook instead of a hand-picked subset.
- [ ] Port the dog energy-requirement and reference-standard (NRC/AAFCO/FEDIAF) target selection.
- [ ] Flag each nutrient against its target (deficient / adequate / excessive).
- [ ] Add the LLM layer: natural language in, structured constraints out, grounded explanation back.



## Try it

```bash
npm install
npm run demo    # analyze the sample recipe
npm test        # unit-invariance + workbook-fidelity tests
```

The engine lives in [src/engine](src/engine), the extracted data in [src/data](src/data), and the tests in [test](test).

## This isn't veterinary advice

This is exploratory software, not veterinary advice. Any plan it produces should come from deterministic math, be checked against an explicitly chosen reference standard (NRC, AAFCO, or FEDIAF), and be presented with its limitations stated plainly. Dogs with medical conditions or on therapeutic diets need a qualified veterinarian or veterinary nutritionist — not a side project.

