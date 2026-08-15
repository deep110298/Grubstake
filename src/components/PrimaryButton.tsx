import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export default function PrimaryButton({
  loading,
  variant = 'primary',
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  const base =
    'w-full rounded-xl px-4 py-3 text-center font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
  const styles =
    variant === 'primary'
      ? 'bg-accent text-accent-foreground hover:bg-orange-700'
      : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300';

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${styles} ${className}`}
      {...rest}
    >
      {loading ? 'Working…' : children}
    </button>
  );
}
