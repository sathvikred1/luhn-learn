// Reusable tag/chip (fully rounded). Used for suggested topics.

export default function Chip({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border-color bg-bg-primary px-4 py-2 text-sm font-medium text-text-secondary transition-all duration-150 hover:border-brand-primary hover:text-brand-primary hover:shadow-sm ${className}`}
    >
      {children}
    </button>
  );
}
