// Reusable tooltip — shows label on hover via CSS group.

export default function Tooltip({ label, children, position = 'bottom' }) {
  const pos =
    position === 'top'
      ? 'bottom-full mb-2'
      : position === 'left'
      ? 'right-full mr-2 top-1/2 -translate-y-1/2'
      : 'top-full mt-2';

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-xs text-bg-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${pos}`}
      >
        {label}
      </span>
    </span>
  );
}
