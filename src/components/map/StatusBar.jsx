// Bottom-left floating pill showing node + connection counts.

export default function StatusBar({ nodeCount, edgeCount }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full border border-border-color bg-bg-primary px-4 py-1.5 text-[13px] text-text-secondary shadow-card">
      <span className="h-2 w-2 rounded-full bg-brand-secondary" />
      <span>
        {nodeCount} nodes · {edgeCount} connections
      </span>
    </div>
  );
}
