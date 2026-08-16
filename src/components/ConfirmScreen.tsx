'use client';

import { useState } from 'react';
import StepShell from './StepShell';
import type { Ingredient, IngredientCategory } from '@/types';

const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  produce: 'Produce',
  protein: 'Protein',
  dairy: 'Dairy',
  pantry: 'Pantry',
  spice: 'Spices',
  other: 'Other',
};

const CATEGORY_ORDER: IngredientCategory[] = [
  'produce',
  'protein',
  'dairy',
  'pantry',
  'spice',
  'other',
];

const LOW_CONFIDENCE_THRESHOLD = 0.7;

function isLowConfidence(item: Ingredient): boolean {
  return item.source === 'detected' && (item.confidence ?? 1) < LOW_CONFIDENCE_THRESHOLD;
}

interface Props {
  ingredients: Ingredient[];
  onBack: () => void;
  onContinue: (ingredients: Ingredient[]) => void;
}

export default function ConfirmScreen({ ingredients: initial, onBack, onContinue }: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initial);
  const [newName, setNewName] = useState('');

  function updateName(id: string, name: string) {
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
  }

  function remove(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }

  function addManual() {
    const name = newName.trim();
    if (!name) return;
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, category: 'other', source: 'manual' },
    ]);
    setNewName('');
  }

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: ingredients.filter((i) => (i.category ?? 'other') === category),
  })).filter((g) => g.items.length > 0);

  const lowConfidenceCount = ingredients.filter(isLowConfidence).length;

  return (
    <StepShell
      step={2}
      title="Confirm ingredients"
      subtitle="Fix anything the camera misread, and add what's not visible."
      onBack={onBack}
      footer={{
        hint: `${ingredients.length} ingredient${ingredients.length === 1 ? '' : 's'} going in`,
        primaryLabel: 'Continue',
        primaryDisabled: ingredients.length === 0,
        onPrimary: () => onContinue(ingredients),
      }}
    >
      {ingredients.length === 0 && (
        <p className="rounded-xl bg-surface-sunken p-[14px] text-[14px] leading-[1.5] text-ink-muted">
          No ingredients yet — add what you have below.
        </p>
      )}

      {lowConfidenceCount > 0 && (
        <div
          className="mb-5 rounded-xl p-[12px_14px] bg-warn-surface"
          style={{ border: '1px solid var(--warn-border)' }}
        >
          <p className="text-[13.5px] font-semibold leading-[1.3] text-warn">
            {lowConfidenceCount} item{lowConfidenceCount === 1 ? '' : 's'} came back under 70% confidence
          </p>
          <p className="mt-[3px] text-[13px] leading-[1.45] text-warn" style={{ opacity: 0.85 }}>
            Retype or remove anything wrong. A bad read here becomes a bad recipe later.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <h2 className="mono-label mb-[9px] text-[11px] text-ink-faint">
              {CATEGORY_LABELS[category]}
            </h2>
            <ul className="space-y-2">
              {items.map((item) => {
                const low = isLowConfidence(item);
                return (
                  <li key={item.id} className="flex items-center gap-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateName(item.id, e.target.value)}
                      className={`box-border min-w-0 flex-1 rounded-[10px] px-[13px] py-[11px] text-[15px] leading-[1.2] ${
                        low ? 'bg-warn-surface text-warn' : 'bg-surface text-ink'
                      }`}
                      style={{
                        border: low ? '1px solid rgba(180,105,14,.3)' : '1px solid var(--input-border)',
                      }}
                    />
                    {low && (
                      <span
                        className="shrink-0 rounded-[5px] px-[5px] py-1 font-mono text-[9.5px] tracking-[.06em] text-warn"
                        style={{ background: 'rgba(180,105,14,.14)' }}
                      >
                        {Math.round((item.confidence ?? 0) * 100)}% sure
                      </span>
                    )}
                    <button
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] text-[13px] text-ink-faintest hover:bg-surface-sunken"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addManual()}
          placeholder="e.g. cumin, soy sauce"
          className="box-border min-w-0 flex-1 rounded-[10px] px-[13px] py-[11px] text-[15px] text-ink"
          style={{ border: '1px solid var(--input-border)', background: 'var(--surface)' }}
        />
        <button
          onClick={addManual}
          className="shrink-0 rounded-[10px] bg-surface-sunken-alt px-4 py-[11px] text-[14.5px] font-semibold text-ink"
        >
          + Add
        </button>
      </div>
    </StepShell>
  );
}
