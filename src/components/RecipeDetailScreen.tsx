'use client';

import { useState } from 'react';
import StepShell from './StepShell';
import { formatQuantity } from '@/lib/quantity';
import type { Recipe } from '@/types';

const DELIVERY_PARTNERS = ['DoorDash', 'Uber Eats', 'Grubhub'];

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onStartOver: () => void;
}

export default function RecipeDetailScreen({ recipe, onBack, onStartOver }: Props) {
  const [servings, setServings] = useState(recipe.servings);
  const [isSaved, setIsSaved] = useState(false);
  const scale = servings / recipe.servings;

  return (
    <StepShell
      step={5}
      title={recipe.title}
      onBack={onBack}
      footer={{
        primaryLabel: isSaved ? '✓ Saved' : '♡ Save recipe',
        primarySaved: isSaved,
        onPrimary: () => setIsSaved((s) => !s),
        secondaryLabel: 'Start over',
        onSecondary: onStartOver,
      }}
    >
      <div
        className="mb-[18px] h-[190px] w-full rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage: recipe.imageUrl ? `url(${recipe.imageUrl})` : 'var(--photo-placeholder)',
        }}
      />

      <div className="flex flex-wrap items-center gap-[10px] font-mono text-[12.5px] text-ink-faint">
        <span className="rounded-[6px] bg-surface-sunken px-2 py-[5px] text-ink-muted">{recipe.cuisine}</span>
        <span>{recipe.timeMinutes} min</span>
        <span className="rounded-full bg-accent-tint px-[9px] py-[5px] text-accent">
          {recipe.matchScore}% match
        </span>
      </div>

      <div className="mt-[18px] flex items-center justify-between">
        <h2 className="mono-label text-[11px] text-ink-faint">Ingredients</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-surface-sunken text-[17px] font-semibold text-ink"
          >
            −
          </button>
          <span className="text-[13px] text-ink-muted">{servings} servings</span>
          <button
            type="button"
            onClick={() => setServings((s) => Math.min(24, s + 1))}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-surface-sunken text-[17px] font-semibold text-ink"
          >
            +
          </button>
        </div>
      </div>

      <div
        className="mt-[10px] overflow-hidden rounded-xl bg-surface"
        style={{ border: '1px solid var(--hairline-card)' }}
      >
        {recipe.ingredients.map((ing, i) => (
          <div
            key={i}
            className="flex items-center gap-[11px] px-[13px] py-[11px]"
            style={{
              borderBottom:
                i < recipe.ingredients.length - 1 ? '1px solid rgba(25,23,20,.06)' : undefined,
            }}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                ing.haveOnHand ? 'bg-accent-tint text-accent' : 'bg-warn-surface text-warn'
              }`}
            >
              {ing.haveOnHand ? '✓' : '＋'}
            </span>
            <span className="flex-1 text-[15px] leading-[1.35]">{ing.name}</span>
            <span className="shrink-0 whitespace-nowrap font-mono text-[13.5px] text-ink-muted">
              {formatQuantity(ing.amount, ing.unit, scale)}
            </span>
          </div>
        ))}
      </div>

      {recipe.missingIngredients.length > 0 && (
        <div
          className="mt-[14px] rounded-2xl bg-warn-surface p-[14px]"
          style={{ border: '1px solid var(--warn-border)' }}
        >
          <p className="text-[14px] font-semibold leading-[1.3] text-warn">
            Short {recipe.missingIngredients.length} ingredient
            {recipe.missingIngredients.length === 1 ? '' : 's'}
          </p>
          <p className="mt-1 text-[13px] leading-[1.45] text-warn" style={{ opacity: 0.85 }}>
            {recipe.missingIngredients.join(', ')}
          </p>

          <div className="mt-3 flex gap-[7px]">
            {DELIVERY_PARTNERS.map((partner) => (
              <button
                key={partner}
                type="button"
                onClick={() => {
                  // Stub: deep-link to the partner's cart pre-filled with
                  // missingIngredients once affiliate/deep-link terms are confirmed.
                }}
                className="flex-1 rounded-[10px] bg-surface px-1 py-[11px] text-center text-[12.5px] font-semibold leading-[1.2] text-warn"
                style={{ border: '1px solid var(--warn-border-strong)' }}
              >
                {partner}
              </button>
            ))}
          </div>
          <p className="mt-[9px] text-[11.5px] leading-[1.4] text-warn" style={{ opacity: 0.7 }}>
            Opens a cart pre-filled with what you&apos;re short.
          </p>
        </div>
      )}

      <h2 className="mono-label mb-3 mt-[22px] text-[11px] text-ink-faint">Steps</h2>
      <ol className="flex flex-col gap-[13px]">
        {recipe.steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-[15.5px] leading-[1.5]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[12px] font-semibold text-canvas">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </StepShell>
  );
}
