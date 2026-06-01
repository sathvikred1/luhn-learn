// Decorative mini concept-map preview with gently floating nodes.

export default function AnimatedPreview() {
  return (
    <div className="relative rounded-2xl border-2 border-dashed border-border-color bg-bg-secondary p-8">
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* dashed connectors (relative positions approximated) */}
        <line x1="50%" y1="28%" x2="22%" y2="72%" stroke="var(--edge-color)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="50%" y1="28%" x2="50%" y2="72%" stroke="var(--edge-color)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="50%" y1="28%" x2="78%" y2="72%" stroke="var(--edge-color)" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>

      <div className="relative flex flex-col items-center gap-12">
        {/* Root */}
        <div className="animate-float rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg">
          Main Topic
        </div>

        {/* Children */}
        <div className="flex w-full items-start justify-between gap-3">
          {['Concept 1', 'Concept 2', 'Concept 3'].map((label, i) => (
            <div
              key={label}
              className="animate-float rounded-xl border-l-4 border-brand-secondary bg-bg-primary px-4 py-2.5 text-xs font-medium text-text-primary shadow-card"
              style={{ animationDelay: `${(i + 1) * 0.4}s` }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
