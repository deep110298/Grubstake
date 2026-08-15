import type { ReactNode } from 'react';

interface StepShellProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function StepShell({
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: StepShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/95 px-4 pt-4 pb-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200"
            >
              ←
            </button>
          ) : (
            <div className="w-8 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < step ? 'bg-accent' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
            <h1 className="mt-2 truncate text-lg font-semibold">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4">
        {children}
      </main>

      {footer && (
        <footer className="sticky bottom-0 border-t border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto max-w-md">{footer}</div>
        </footer>
      )}
    </div>
  );
}
