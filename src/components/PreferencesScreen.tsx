'use client';

import { useState } from 'react';
import StepShell from './StepShell';
import type {
  DietType,
  Equipment,
  Ingredient,
  Preferences,
  Recipe,
  SpiceLevel,
  TimeAvailable,
} from '@/types';

const CUISINES = [
  'Italian',
  'Mexican',
  'Indian',
  'Chinese',
  'Thai',
  'Japanese',
  'Mediterranean',
  'American',
  'French',
  'Korean',
];

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non_veg', label: 'Non-veg' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'eggetarian', label: 'Eggetarian' },
];

const ALLERGY_OPTIONS = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Egg'];

const TIME_OPTIONS: { value: TimeAvailable; label: string }[] = [
  { value: 'quick', label: 'Quick (<20 min)' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'no_rush', label: 'No rush' },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'stovetop', label: 'Stovetop' },
  { value: 'oven', label: 'Oven' },
  { value: 'air_fryer', label: 'Air fryer' },
  { value: 'instant_pot', label: 'Instant Pot' },
  { value: 'microwave', label: 'Microwave-only' },
];

const SPICE_OPTIONS: { value: SpiceLevel; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'hot', label: 'Spicy' },
];

function Chip({
  selected,
  onClick,
  className = '',
  children,
}: {
  selected: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] px-[13px] py-[9px] text-sm font-medium leading-none transition ${
        selected ? 'bg-accent text-canvas' : 'bg-surface text-ink'
      } ${className}`}
      style={{
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--input-border)'}`,
      }}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mono-label mb-[9px] text-[11px] text-ink-faint">{children}</h2>;
}

interface Props {
  ingredients: Ingredient[];
  onBack: () => void;
  onContinue: (recipes: Recipe[], droppedByAllergenCheck: number) => void;
}

export default function PreferencesScreen({ ingredients, onBack, onContinue }: Props) {
  const [cuisine, setCuisine] = useState('surprise_me');
  const [dietType, setDietType] = useState<DietType>('veg');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyText, setAllergyText] = useState('');
  const [servings, setServings] = useState(2);
  const [showMore, setShowMore] = useState(false);
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailable | undefined>();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel | undefined>();
  const [excludeText, setExcludeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAllergy(label: string) {
    setAllergies((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  }

  function toggleEquipment(value: Equipment) {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  }

  async function handleContinue() {
    const freeTextAllergies = allergyText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const preferences: Preferences = {
      cuisine,
      dietType,
      allergies: [...allergies.map((a) => a.toLowerCase()), ...freeTextAllergies],
      servings,
      timeAvailable,
      equipment: equipment.length ? equipment : undefined,
      spiceLevel,
      excludeIngredients: excludeText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, preferences }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as { recipes: Recipe[]; droppedByAllergenCheck: number };
      onContinue(data.recipes, data.droppedByAllergenCheck);
    } catch {
      setError("Couldn't generate recipes. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <StepShell
      step={3}
      title="Your preferences"
      onBack={onBack}
      footer={{
        error,
        primaryLabel: 'Find recipes',
        primaryLoading: isGenerating,
        onPrimary: handleContinue,
      }}
    >
      <div className="space-y-5">
        <section>
          <SectionLabel>Cuisine</SectionLabel>
          <div className="flex flex-wrap gap-[7px]">
            <Chip selected={cuisine === 'surprise_me'} onClick={() => setCuisine('surprise_me')}>
              Surprise me
            </Chip>
            {CUISINES.map((c) => (
              <Chip key={c} selected={cuisine === c} onClick={() => setCuisine(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Diet type</SectionLabel>
          <div className="flex flex-wrap gap-[7px]">
            {DIET_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={dietType === opt.value} onClick={() => setDietType(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Allergies</SectionLabel>
          <div className="flex flex-wrap gap-[7px]">
            {ALLERGY_OPTIONS.map((a) => (
              <Chip key={a} selected={allergies.includes(a)} onClick={() => toggleAllergy(a)}>
                {a}
              </Chip>
            ))}
          </div>
          <input
            value={allergyText}
            onChange={(e) => setAllergyText(e.target.value)}
            placeholder="Other allergies, comma separated"
            className="mt-[9px] box-border w-full rounded-[10px] px-[13px] py-[11px] text-[14.5px] text-ink"
            style={{ border: '1px solid var(--input-border)', background: 'var(--surface)' }}
          />
        </section>

        <section>
          <SectionLabel>Servings</SectionLabel>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface-sunken text-[19px] font-semibold text-ink"
            >
              −
            </button>
            <span className="min-w-[22px] text-center text-[17px] font-semibold">{servings}</span>
            <button
              type="button"
              onClick={() => setServings((s) => Math.min(12, s + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface-sunken text-[19px] font-semibold text-ink"
            >
              +
            </button>
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setShowMore((s) => !s)}
            className="flex w-full items-center justify-between rounded-[10px] bg-surface-sunken px-[14px] py-3 text-sm font-semibold text-ink"
          >
            More options
            <span className="font-mono text-[15px] text-ink-muted">{showMore ? '−' : '+'}</span>
          </button>

          {showMore && (
            <div className="mt-4 space-y-5">
              <div>
                <SectionLabel>Time available</SectionLabel>
                <div className="flex flex-wrap gap-[7px]">
                  {TIME_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      selected={timeAvailable === opt.value}
                      onClick={() => setTimeAvailable(timeAvailable === opt.value ? undefined : opt.value)}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Equipment</SectionLabel>
                <div className="flex flex-wrap gap-[7px]">
                  {EQUIPMENT_OPTIONS.map((opt) => (
                    <Chip key={opt.value} selected={equipment.includes(opt.value)} onClick={() => toggleEquipment(opt.value)}>
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Spice level</SectionLabel>
                <div className="flex gap-[7px]">
                  {SPICE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      selected={spiceLevel === opt.value}
                      onClick={() => setSpiceLevel(spiceLevel === opt.value ? undefined : opt.value)}
                      className="flex-1 py-[10px] px-[6px] text-center"
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Exclude</SectionLabel>
                <input
                  value={excludeText}
                  onChange={(e) => setExcludeText(e.target.value)}
                  placeholder="e.g. cilantro (comma separated)"
                  className="box-border w-full rounded-[10px] px-[13px] py-[11px] text-[14.5px] text-ink"
                  style={{ border: '1px solid var(--input-border)', background: 'var(--surface)' }}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </StepShell>
  );
}
