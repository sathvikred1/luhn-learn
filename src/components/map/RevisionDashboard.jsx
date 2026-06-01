import { Target } from 'lucide-react';
import { LEARNING_STATUSES } from '../../config/constants';
import { getRecommendedNextNode, statusLabel } from '../../utils/learningUtils';

export default function RevisionDashboard({ nodes, onOpenNode }) {
  if (!nodes.length) return null;

  const groups = [
    ['Needs Revision', LEARNING_STATUSES.NEEDS_REVISION],
    ['Not Started', LEARNING_STATUSES.NOT_STARTED],
    ['Mastered', LEARNING_STATUSES.MASTERED],
  ];
  const recommended = getRecommendedNextNode(nodes);

  return (
    <div className="absolute bottom-16 left-4 z-20 w-[260px] rounded-card border border-toolbar-border bg-toolbar-bg p-3 shadow-modal max-lg:hidden">
      <div className="mb-3 flex items-start gap-2">
        <Target size={17} className="mt-0.5 text-brand-primary" />
        <div>
          <p className="text-sm font-semibold text-text-primary">Revision Path</p>
          {recommended && (
            <button
              onClick={() => onOpenNode(recommended.id)}
              className="mt-1 text-left text-xs font-medium text-brand-primary hover:underline"
            >
              Next: {recommended.data.label}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {groups.map(([title, status]) => {
          const items = nodes.filter((node) => node.data.learningStatus === status).slice(0, 4);
          return (
            <div key={status}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-tertiary">
                {title}
              </p>
              {items.length ? (
                <div className="space-y-1">
                  {items.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => onOpenNode(node.id)}
                      className="block w-full truncate rounded-md px-2 py-1 text-left text-xs text-text-secondary hover:bg-toolbar-button-hover"
                    >
                      {node.data.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-tertiary">No {statusLabel(status).toLowerCase()} concepts.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
