// Floating popup explaining a connection when an edge label is clicked.

import { X, Link2, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function EdgeInfoPopup({ info, onClose, onUpdateLabel }) {
  if (!info) return null;

  const { label, description, sourceLabel, targetLabel, position, loading } = info;

  return (
    <div
      className="absolute z-30 max-w-80 animate-scale-in rounded-card border border-border-color bg-bg-primary p-4 shadow-modal"
      style={{ left: position.x, top: position.y, width: 320 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-tertiary">
        <Link2 size={14} /> Connection
      </div>

      <p className="mb-2 font-heading text-base font-semibold text-text-primary">
        {label}
      </p>
      <input
        value={label || ''}
        onChange={(e) => onUpdateLabel?.(info.edgeId, e.target.value)}
        className="mb-3 w-full rounded-input border border-border-color bg-bg-primary px-2 py-1.5 text-sm text-text-primary"
        placeholder="Relationship label"
      />

      {loading ? (
        <div className="py-3">
          <LoadingSpinner size={18} label="Loading explanation…" />
        </div>
      ) : (
        <p className="mb-3 text-sm leading-relaxed text-text-secondary">
          {description || 'No description available.'}
        </p>
      )}

      <div className="flex items-center gap-2 border-t border-border-color pt-3 text-xs">
        <span className="rounded-full bg-bg-tertiary px-2 py-1 font-medium text-text-secondary">
          {sourceLabel}
        </span>
        <ArrowRight size={14} className="text-text-tertiary" />
        <span className="rounded-full bg-bg-tertiary px-2 py-1 font-medium text-text-secondary">
          {targetLabel}
        </span>
      </div>
    </div>
  );
}
