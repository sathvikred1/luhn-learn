import { CheckCircle2, RotateCcw, Circle, BookOpen } from 'lucide-react';

export default function ProgressDashboard({ progress }) {
  if (!progress.total) return null;

  const stats = [
    { label: 'Not Started', value: progress.notStarted, icon: Circle },
    { label: 'Learning', value: progress.learning, icon: BookOpen },
    { label: 'Needs Revision', value: progress.needsRevision, icon: RotateCcw },
    { label: 'Mastered', value: progress.mastered, icon: CheckCircle2 },
  ];

  return (
    <div className="absolute left-4 top-[230px] z-20 w-[220px] rounded-card border border-toolbar-border bg-toolbar-bg p-3 shadow-modal max-lg:hidden">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary">Progress</p>
        <p className="text-sm font-bold text-brand-primary">{progress.completion}%</p>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className="h-full bg-brand-primary"
          style={{ width: `${progress.completion}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-md bg-bg-secondary p-2">
            <Icon size={14} className="mb-1 text-text-tertiary" />
            <p className="text-base font-bold text-text-primary">{value}</p>
            <p className="text-[11px] leading-tight text-text-tertiary">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
