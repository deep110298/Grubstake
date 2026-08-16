import type { ReactNode } from 'react';

export interface FooterConfig {
  error?: string | null;
  hint?: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primarySaved?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

interface StepShellProps {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: FooterConfig;
}

export default function StepShell({
  step,
  totalSteps = 5,
  title,
  subtitle,
  onBack,
  children,
  footer,
}: StepShellProps) {
  const counter = `${String(step).padStart(2, '0')} / ${String(totalSteps).padStart(2, '0')}`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
      <header
        className="flex-none"
        style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 62px) 20px 18px' }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3" style={{ minHeight: 30 }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="-ml-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[17px] text-ink hover:bg-surface-sunken"
            >
              ‹
            </button>
          )}
          <div className="flex flex-1 items-center gap-2.5">
            <div className="h-[3px] w-full max-w-[112px] flex-1 rounded-full bg-[#E4E0D8]">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            <span className="shrink-0 font-mono text-[11px] leading-none tracking-[.08em] text-ink-faintest">
              {counter}
            </span>
          </div>
        </div>

        <h1 className="mt-3.5 text-[30px] font-semibold leading-[1.1] tracking-[-.03em]">
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-2 max-w-[32ch] text-[14.5px] leading-[1.5] text-ink-faint"
            style={{ textWrap: 'pretty' }}
          >
            {subtitle}
          </p>
        )}
      </header>

      <main
        className="mx-auto w-full max-w-md flex-1 overflow-y-auto"
        style={{ padding: '18px 20px 22px' }}
      >
        {children}
      </main>

      {footer && (
        <footer
          className="flex-none border-t"
          style={{ padding: '12px 20px 22px', borderColor: 'var(--hairline)' }}
        >
          <div className="mx-auto flex max-w-md flex-col gap-[9px]">
            {footer.error && (
              <p className="text-[13px] leading-[1.4] text-error">{footer.error}</p>
            )}
            {footer.hint && (
              <p className="text-center text-[12.5px] leading-none text-ink-faint">
                {footer.hint}
              </p>
            )}
            <button
              type="button"
              onClick={footer.onPrimary}
              disabled={footer.primaryDisabled || footer.primaryLoading}
              className={`box-border w-full rounded-xl border px-4 py-[15px] text-center text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                footer.primarySaved
                  ? 'bg-accent-tint text-accent'
                  : 'border-accent bg-accent text-canvas'
              }`}
              style={footer.primarySaved ? { borderColor: 'rgba(47,107,79,.3)' } : undefined}
            >
              {footer.primaryLoading ? 'Working…' : footer.primaryLabel}
            </button>
            {footer.secondaryLabel && (
              <button
                type="button"
                onClick={footer.onSecondary}
                className="box-border w-full rounded-xl bg-surface-sunken-alt px-4 py-[15px] text-center text-base font-semibold text-ink"
              >
                {footer.secondaryLabel}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
