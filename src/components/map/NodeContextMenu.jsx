import {
  BookOpen,
  Edit3,
  Image,
  Link2,
  Plus,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';

export default function NodeContextMenu({
  menu,
  connectingFrom,
  hasAttachedImage,
  nodeKind,
  onAction,
  onClose,
}) {
  if (!menu) return null;

  const { label, depth, position } = menu;
  const fromLabel = connectingFrom?.label || 'selected node';

  const items = [
    { key: 'details', icon: BookOpen, title: nodeKind === 'image' ? 'Preview image' : 'View details', description: 'Open panel' },
    ...(nodeKind === 'concept'
      ? [{ key: 'expand', icon: Plus, title: 'Expand concept', description: 'Use remaining expansion quota' }]
      : []),
    ...(nodeKind === 'concept'
      ? [
          { key: 'add-note', icon: Plus, title: 'Add note under concept', description: 'Save inline under this concept' },
          { key: 'attach-image', icon: Image, title: 'Attach saved material', description: 'Choose inline or connected mode' },
        ]
      : [
          { key: 'attach-to-concept', icon: Plus, title: `Attach this ${nodeKind} under concept`, description: 'Copy into a concept panel' },
        ]),
    ...(hasAttachedImage || nodeKind === 'image'
      ? [{ key: 'analyze-image', icon: Wand2, title: 'Analyze attached image', description: 'Run Gemini Vision on image' }]
      : []),
    { key: 'edit-node', icon: Edit3, title: 'Edit node', description: 'Edit title and summary' },
    { key: 'delete-node', icon: Trash2, title: 'Delete node', description: 'Custom nodes only' },
    connectingFrom && connectingFrom.nodeId !== menu.nodeId
      ? { key: 'finish-connect', icon: Link2, title: `Connect from ${fromLabel}`, description: 'Create relationship edge' }
      : { key: 'start-connect', icon: Link2, title: 'Start connection', description: 'Pick another node next' },
  ];

  return (
    <div
      className="fixed z-[1000] w-64 max-h-[calc(100vh-16px)] animate-scale-in overflow-y-auto rounded-card border border-border-color bg-bg-primary p-2 shadow-modal"
      style={{ left: position.x, top: position.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="border-b border-border-color px-2 pb-2">
        <p className="truncate font-semibold text-text-primary" title={label}>
          {label}
        </p>
        <p className="text-xs text-text-tertiary">{depth} levels deep</p>
      </div>

      <div className="py-1">
        {items.map(({ key, icon: Icon, title, description }) => (
          <button
            key={key}
            onClick={() => onAction(key)}
            className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg-tertiary"
          >
            <span className="mt-0.5 text-brand-primary">
              <Icon size={17} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-text-primary">
                {title}
              </span>
              <span className="block text-xs text-text-tertiary">{description}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onClose}
        className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-tertiary transition-colors hover:bg-bg-tertiary"
      >
        <X size={14} />
        Cancel
      </button>
    </div>
  );
}
