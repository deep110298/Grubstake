'use client';

import { useRef, useState } from 'react';
import StepShell from './StepShell';
import PrimaryButton from './PrimaryButton';
import { compressImage } from '@/lib/image';
import type { CaptureCategory, CapturedPhoto, Ingredient } from '@/types';

const CATEGORIES: { id: CaptureCategory; label: string; hint: string }[] = [
  { id: 'fridge', label: 'Fridge', hint: 'Shelves, drawers, door — whatever you can fit in frame' },
  { id: 'freezer', label: 'Freezer', hint: 'Frozen produce, meat, ready meals' },
  { id: 'pantry', label: 'Pantry', hint: 'Cans, grains, boxed goods, condiments' },
];

interface Props {
  onComplete: (ingredients: Ingredient[]) => void;
}

export default function CaptureScreen({ onComplete }: Props) {
  const [active, setActive] = useState<CaptureCategory>('fridge');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setIsCompressing(true);
    setError(null);
    try {
      const compressed = await Promise.all(
        Array.from(files).map(async (file) => {
          const { dataUrl, base64, mediaType } = await compressImage(file);
          const photo: CapturedPhoto = {
            id: crypto.randomUUID(),
            category: active,
            dataUrl,
            base64,
            mediaType,
          };
          return photo;
        })
      );
      setPhotos((prev) => [...prev, ...compressed]);
    } catch {
      setError("Couldn't process that photo — try another.");
    } finally {
      setIsCompressing(false);
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleContinue() {
    if (photos.length === 0) {
      onComplete([]);
      return;
    }
    setIsDetecting(true);
    setError(null);
    try {
      const res = await fetch('/api/detect-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photos.map(({ category, base64, mediaType }) => ({
            category,
            base64,
            mediaType,
          })),
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as { ingredients: Ingredient[] };
      onComplete(data.ingredients);
    } catch {
      setError("Couldn't read those photos. Check your connection and try again.");
    } finally {
      setIsDetecting(false);
    }
  }

  const photosInActive = photos.filter((p) => p.category === active);
  const countFor = (cat: CaptureCategory) => photos.filter((p) => p.category === cat).length;
  const busy = isCompressing || isDetecting;

  return (
    <StepShell
      step={1}
      totalSteps={5}
      title="What's in your kitchen?"
      subtitle="Snap each area separately — cleaner shots detect better than one packed photo."
      footer={
        <div className="space-y-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <PrimaryButton onClick={handleContinue} loading={isDetecting} disabled={isCompressing}>
            {photos.length === 0 ? 'Skip — I\'ll add ingredients manually' : 'Continue'}
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active === cat.id
                ? 'bg-accent text-accent-foreground'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            {cat.label}
            {countFor(cat.id) > 0 && (
              <span className="ml-1.5 opacity-80">({countFor(cat.id)})</span>
            )}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-neutral-500">
        {CATEGORIES.find((c) => c.id === active)?.hint}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {photosInActive.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => removePhoto(photo.id)}
              aria-label="Remove photo"
              className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={busy}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <span className="text-xl">📷</span>
          <span className="text-xs">Camera</span>
        </button>

        <button
          onClick={() => libraryInputRef.current?.click()}
          disabled={busy}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 text-neutral-500 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <span className="text-xl">🖼️</span>
          <span className="text-xs">Library</span>
        </button>
      </div>

      {isCompressing && (
        <p className="mt-3 text-sm text-neutral-500">Processing photos…</p>
      )}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </StepShell>
  );
}
