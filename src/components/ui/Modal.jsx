// Reusable modal wrapper with backdrop blur, title, and close button.

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full animate-scale-in rounded-modal bg-bg-primary shadow-modal border border-border-color"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-color px-6 py-4">
          <h3 className="font-heading text-lg font-semibold text-text-primary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
