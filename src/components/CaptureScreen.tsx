'use client';

import { useRef, useState } from 'react';
import StepShell from './StepShell';
import { compressImage } from '@/lib/image';
import type { CaptureCategory, CapturedPhoto, Ingredient } from '@/types';

const CATEGORIES: { id: CaptureCategory; label: string; hint: string }[] = [
  { id: 'fridge', label: 'Fridge', hint: 'Shelves, drawers, door — whatever you can fit in frame' },
  { id: 'freezer', label: 'Freezer', hint: 'Frozen produce, meat, ready meals' },
  { id: 'pantry', label: 'Pantry', hint: 'Cans, grains, boxed goods, condiments' },
];

function FridgeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="1.5" />
      <line x1="5" y1="9.5" x2="19" y2="9.5" />
      <line x1="8" y1="4" x2="8" y2="6.5" />
      <line x1="8" y1="11.5" x2="8" y2="14" />
    </svg>
  );
}

function SnowflakeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="4.5" y1="7.5" x2="19.5" y2="16.5" />
      <line x1="19.5" y1="7.5" x2="4.5" y2="16.5" />
      <polyline points="9.5,4.5 12,3 14.5,4.5" />
      <polyline points="9.5,19.5 12,21 14.5,19.5" />
      <polyline points="5,10.7 4.5,7.5 7.4,6.3" />
      <polyline points="16.6,17.7 19.5,16.5 19,13.3" />
      <polyline points="16.6,6.3 19.5,7.5 19,10.7" />
      <polyline points="5,13.3 4.5,16.5 7.4,17.7" />
    </svg>
  );
}

function PantryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="9.5" y1="6" x2="9.5" y2="7.6" />
      <line x1="14.5" y1="6" x2="14.5" y2="7.6" />
    </svg>
  );
}

function CameraGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 8a2 2 0 0 1 2-2h2l1.2-1.6a1 1 0 0 1 .8-.4h4a1 1 0 0 1 .8.4L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </svg>
  );
}

const ICONS: Record<CaptureCategory, (props: { className?: string }) => React.ReactElement> = {
  fridge: FridgeIcon,
  freezer: SnowflakeIcon,
  pantry: PantryIcon,
};

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
  const activeMeta = CATEGORIES.find((c) => c.id === active)!;
  const areasWithPhotos = CATEGORIES.filter((c) => countFor(c.id) > 0).length;

  const hint =
    photos.length === 0
      ? undefined
      : `${photos.length} photo${photos.length === 1 ? '' : 's'} across ${areasWithPhotos} of 3 areas`;

  return (
    <StepShell
      step={1}
      title="What's in your kitchen?"
      subtitle="Three quick photos and dinner sorts itself out."
      footer={{
        error,
        hint,
        primaryLabel: photos.length === 0 ? "Skip — I'll add ingredients manually" : 'Continue',
        primaryLoading: isDetecting,
        primaryDisabled: isCompressing,
        onPrimary: handleContinue,
      }}
    >
      <div className="flex gap-1 rounded-xl bg-surface-sunken p-1">
        {CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.id];
          const isActive = active === cat.id;
          const count = countFor(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`flex flex-1 flex-col gap-[7px] rounded-[9px] p-[7px] transition ${
                isActive ? 'bg-surface shadow-[0_1px_2px_rgba(25,23,20,.08)]' : 'text-ink-muted'
              }`}
            >
              <span
                className={`flex h-[52px] w-full items-center justify-center rounded-[7px] ${
                  isActive ? 'bg-accent-tint text-accent' : 'text-ink-faint'
                }`}
                style={!isActive ? { background: 'rgba(25,23,20,.05)' } : undefined}
              >
                <Icon className="h-[26px] w-[26px]" />
              </span>
              <span className="flex items-center justify-center gap-1.5">
                <span className="text-sm font-medium">{cat.label}</span>
                {count > 0 && (
                  <span className="font-mono text-[11px] text-accent">{count}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm leading-[1.45] text-ink-muted">{activeMeta.hint}</p>

      <button
        onClick={() => cameraInputRef.current?.click()}
        disabled={busy}
        className="relative mt-3.5 flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[18px] disabled:opacity-60"
        style={{ background: '#FCFBF8', border: '1px solid rgba(25,23,20,.1)' }}
      >
        <span
          className="pointer-events-none absolute rounded-xl"
          style={{ inset: 14, border: '1px dashed rgba(25,23,20,.14)' }}
        />
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <CameraGlyph className="h-7 w-7 text-canvas" />
        </span>
        <span className="text-center">
          <span className="block text-base font-semibold text-ink">
            {photosInActive.length === 0 ? `Photograph the ${active}` : 'Add another shot'}
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-faint">Tap to open the camera</span>
        </span>
      </button>

      <div className="mt-2.5 text-center">
        <button
          onClick={() => libraryInputRef.current?.click()}
          disabled={busy}
          className="rounded-[10px] px-3.5 py-2 text-[13.5px] font-medium text-accent disabled:opacity-60"
        >
          Choose from library
        </button>
      </div>

      {photosInActive.length > 0 && (
        <div className="mt-4">
          <p className="mono-label text-[11px] text-ink-faint">
            {photosInActive.length} {activeMeta.label.toLowerCase()} shot{photosInActive.length === 1 ? '' : 's'}
          </p>
          <div className="mt-[9px] flex flex-wrap gap-2">
            {photosInActive.map((photo) => (
              <div key={photo.id} className="relative h-[78px] w-[78px] overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => removePhoto(photo.id)}
                  aria-label="Remove photo"
                  className="absolute top-[5px] right-[5px] flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white"
                  style={{ background: 'rgba(25,23,20,.6)' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCompressing && (
        <p className="mt-3.5 text-[13.5px] leading-[1.4] text-warn-in-progress">Processing photo…</p>
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
