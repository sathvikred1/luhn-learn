// Loading indicator. Optional full-canvas overlay variant.

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, label, overlay = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 size={size} className="animate-spin text-brand-primary" />
      {label && <p className="text-sm text-text-secondary">{label}</p>}
    </div>
  );

  if (!overlay) return spinner;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg-secondary/70 backdrop-blur-sm">
      {spinner}
    </div>
  );
}
