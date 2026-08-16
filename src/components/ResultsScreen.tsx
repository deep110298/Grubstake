'use client';

import StepShell from './StepShell';
import type { Recipe } from '@/types';

interface Props {
  recipes: Recipe[];
  droppedByAllergenCheck: number;
  onBack: () => void;
  onSelect: (recipe: Recipe) => void;
}

export default function ResultsScreen({ recipes, droppedByAllergenCheck, onBack, onSelect }: Props) {
  const subtitle =
    recipes.length === 0
      ? undefined
      : `${recipes.length} recipe${recipes.length === 1 ? '' : 's'}, ranked by match`;

  return (
    <StepShell step={4} title="Recipes for you" subtitle={subtitle} onBack={onBack}>
      {droppedByAllergenCheck > 0 && (
        <div
          className="mb-3 rounded-xl bg-warn-surface p-[13px_14px] text-[13px] leading-[1.45] text-warn"
          style={{ border: '1px solid var(--warn-border)' }}
        >
          {droppedByAllergenCheck} recipe{droppedByAllergenCheck === 1 ? ' was' : 's were'} dropped by
          the allergen check after generation — not shown.
        </div>
      )}

      {recipes.length === 0 && (
        <p className="rounded-xl bg-surface-sunken p-4 text-[14px] leading-[1.5] text-ink-muted">
          No recipes came back that fit your constraints. Try loosening a preference and go back.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {recipes.map((recipe) => {
          const atMax = recipe.matchScore >= 100;
          return (
            <div
              key={recipe.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(recipe)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelect(recipe);
              }}
              className="cursor-pointer overflow-hidden rounded-2xl bg-surface"
              style={{
                border: '1px solid var(--hairline-card)',
                boxShadow: '0 1px 3px rgba(25,23,20,.05)',
              }}
            >
              <div
                className="h-[150px] w-full bg-cover bg-center"
                style={{
                  backgroundImage: recipe.imageUrl
                    ? `url(${recipe.imageUrl})`
                    : 'var(--photo-placeholder)',
                }}
              />

              <div className="p-4">
                <div className="flex items-start gap-3">
                  <h2 className="flex-1 text-[18px] font-semibold leading-[1.25] tracking-[-.01em]">
                    {recipe.title}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-[9px] py-1 font-mono text-[11.5px] font-semibold ${
                      atMax ? 'bg-accent text-canvas' : 'bg-accent-tint text-accent'
                    }`}
                  >
                    {recipe.matchScore}% match
                  </span>
                </div>

                <div className="mt-[9px] h-1 overflow-hidden rounded-full bg-surface-sunken-alt">
                  <div
                    className={`h-full rounded-full ${atMax ? 'bg-accent' : 'bg-accent-muted'}`}
                    style={{ width: `${recipe.matchScore}%` }}
                  />
                </div>

                <div className="mt-[10px] flex flex-wrap items-center gap-[10px] font-mono text-[12.5px] text-ink-faint">
                  <span className="rounded-[6px] bg-surface-sunken px-2 py-[5px] text-ink-muted">
                    {recipe.cuisine}
                  </span>
                  <span>{recipe.timeMinutes} min</span>
                  <span>{recipe.servings} servings</span>
                </div>

                {recipe.missingIngredients.length > 0 ? (
                  <p className="mt-[10px] text-[13.5px] leading-[1.45] text-warn">
                    Missing {recipe.missingIngredients.length}: {recipe.missingIngredients.join(', ')}
                  </p>
                ) : (
                  <p className="mt-[10px] text-[13.5px] leading-[1.45] text-accent">
                    You have everything for this one
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </StepShell>
  );
}
