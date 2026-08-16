import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, RECIPE_MODEL, extractJson } from '@/lib/anthropic';
import { filterSafeRecipes } from '@/lib/allergenCheck';
import { rankAndFilterRecipes, type CandidateRecipe } from '@/lib/rankRecipes';
import type { Ingredient, Preferences } from '@/types';

const SYSTEM_PROMPT = `You are a recipe generator. Given a list of available ingredients
and user preferences, generate 4-6 candidate recipes — more than will be
shown, so a downstream filter has room to work.

HARD CONSTRAINTS (never violate):
- Every recipe must exclude all listed allergens completely — no
  substitutions that reintroduce them, no "trace amount" suggestions.
- Respect dietType strictly (non_veg recipes must not appear for veg/vegan users).
- Respect excludeIngredients even if the ingredient is on hand.

Classify each recipe's own dietType as "vegan", "veg", "eggetarian", or
"non_veg" based on its actual ingredients — this is used to double-check
your own diet filtering downstream, so classify honestly even if it means
a recipe gets filtered out.

Return ONLY valid JSON matching this shape, no other text:
[{"title": string, "cuisine": string, "dietType": "vegan"|"veg"|"eggetarian"|"non_veg", "matchScore": number, "missingIngredients": string[], "servings": number, "timeMinutes": number, "ingredients": [{"name": string, "amount": number, "unit": string, "haveOnHand": boolean}], "steps": string[]}]`;

function buildUserPrompt(
  ingredients: Ingredient[],
  preferences: Preferences,
  avoid?: string[]
): string {
  const lines = [
    `Available ingredients: ${ingredients.map((i) => i.name).join(', ') || 'none listed'}`,
    `Cuisine preference: ${preferences.cuisine}`,
    `Diet type: ${preferences.dietType}`,
    `Allergies (must exclude entirely): ${preferences.allergies.join(', ') || 'none'}`,
    `Servings: ${preferences.servings}`,
  ];
  if (preferences.timeAvailable) lines.push(`Time available: ${preferences.timeAvailable}`);
  if (preferences.equipment?.length) lines.push(`Equipment on hand: ${preferences.equipment.join(', ')}`);
  if (preferences.spiceLevel) lines.push(`Spice level: ${preferences.spiceLevel}`);
  if (preferences.excludeIngredients?.length)
    lines.push(`Exclude even if on hand: ${preferences.excludeIngredients.join(', ')}`);
  if (avoid?.length)
    lines.push(
      `The previous attempt incorrectly included these allergens — regenerate without them: ${avoid.join(', ')}`
    );
  return lines.join('\n');
}

async function requestRecipes(
  ingredients: Ingredient[],
  preferences: Preferences,
  avoid?: string[]
): Promise<CandidateRecipe[]> {
  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: RECIPE_MODEL,
    max_tokens: 6144,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: buildUserPrompt(ingredients, preferences, avoid) },
    ],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') return [];

  const parsed = extractJson<Omit<CandidateRecipe, 'id'>[]>(textBlock.text);
  return parsed.map((recipe) => ({ ...recipe, id: crypto.randomUUID() }));
}

export async function POST(req: NextRequest) {
  try {
    const { ingredients, preferences } = (await req.json()) as {
      ingredients: Ingredient[];
      preferences: Preferences;
    };

    let candidates = await requestRecipes(ingredients, preferences);
    let { safe, violations } = filterSafeRecipes(candidates, preferences.allergies);

    // Safety-critical: never trust the model's own allergen exclusion.
    // One regeneration pass naming the exact offending allergens, then
    // drop anything that still fails rather than ever serving it.
    if (violations.length > 0) {
      const avoid = Array.from(new Set(violations.map((v) => v.allergen)));
      candidates = await requestRecipes(ingredients, preferences, avoid);
      ({ safe, violations } = filterSafeRecipes(candidates, preferences.allergies));

      if (violations.length > 0) {
        console.warn('Dropping recipes that still violate allergens after retry', violations);
      }
    }

    const droppedByAllergenCheck = new Set(violations.map((v) => v.recipeId)).size;
    const recipes = rankAndFilterRecipes(safe as CandidateRecipe[], ingredients, preferences);

    return NextResponse.json({ recipes, droppedByAllergenCheck });
  } catch (error) {
    console.error('generate-recipes failed', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
