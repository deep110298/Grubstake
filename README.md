# Grubstake

Photograph what's in your fridge/pantry, answer a few quick questions, get a recipe you can actually cook tonight.

## Getting Started

```bash
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it's built

- **Frontend**: Next.js (App Router) + Tailwind, mobile-first, guest/session-only for V1
- **AI**: two Anthropic API calls under `src/app/api/`
  - `detect-ingredients` — vision call (`claude-sonnet-5`) grouped by fridge/freezer/pantry
  - `generate-recipes` — recipe generation (`claude-sonnet-5` by default; `RECIPE_MODEL` env var can swap in a cheaper model)
- **Allergen safety**: `src/lib/allergenCheck.ts` is a code-level check run after every recipe-generation response — it never relies on the prompt alone. A violation triggers one regeneration attempt naming the offending allergens; anything still unsafe after that is dropped rather than shown.

## V2 (not yet built)

Supabase auth + saved/favorite recipes, recipe history, shopping list generation, "make it again," and sharing.
