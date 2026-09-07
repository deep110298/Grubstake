import type { ReactNode } from 'react';

export default function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-hairline bg-surface p-5 shadow-lg">
        {children}
      </div>
    </div>
  );
}
