// Custom React Flow node, styled by depth. Draggable by default.

import { memo } from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { getNodeColorsByDepth } from '../../utils/colorUtils';
import { statusClass, statusLabel } from '../../utils/learningUtils';

function ConceptNode({ data, selected, sourcePosition, targetPosition }) {
  const depth = data.depth ?? 0;
  const colors = getNodeColorsByDepth(depth);
  const isRoot = colors.isRoot;
  const status = data.learningStatus || 'not_started';
  const kind = data.kind || 'concept';

  if (kind === 'note' || kind === 'image') {
    return (
      <div
        className="rounded-card border border-border-color bg-bg-primary p-3 text-left font-body shadow-card transition-transform duration-200 hover:scale-[1.02]"
        style={{ width: 210, minHeight: kind === 'image' ? 170 : 120 }}
      >
        <Handle type="target" position={targetPosition || Position.Top} isConnectable />
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-text-tertiary">
            {kind === 'note' ? <FileText size={12} /> : <ImageIcon size={12} />}
            {kind}
          </span>
        </div>
        {kind === 'image' && data.thumbnailUrl ? (
          <img
            src={data.thumbnailUrl}
            alt={data.label}
            className="mb-2 h-20 w-full rounded-md object-cover"
          />
        ) : null}
        <p className="line-clamp-2 text-sm font-semibold text-text-primary">{data.label}</p>
        {data.summary ? (
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-text-secondary">
            {data.summary}
          </p>
        ) : null}
        {kind === 'image' && data.sourceType ? (
          <span className="mt-2 inline-flex rounded-full bg-bg-secondary px-2 py-0.5 text-[10px] text-text-tertiary">
            {data.sourceType.replaceAll('_', ' ')}
          </span>
        ) : null}
        <Handle type="source" position={sourcePosition || Position.Bottom} isConnectable />
      </div>
    );
  }

  const baseStyle = isRoot
    ? {
        background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 100%)',
        color: 'var(--node-root-text)',
        minWidth: 160,
        padding: '14px 24px',
        boxShadow: selected
          ? '0 0 0 3px var(--brand-primary), 0 4px 16px rgba(108,92,231,0.4)'
          : '0 4px 20px rgba(108,92,231,0.35)',
      }
    : {
        background: colors.background,
        color: colors.text,
        borderLeft: `4px solid ${colors.borderColor}`,
        outline: status === 'mastered' ? '2px solid #10b981' : status === 'needs_revision' ? '2px solid #f59e0b' : 'none',
        minWidth: 140,
        padding: '10px 20px',
        boxShadow: selected
          ? '0 0 0 3px var(--brand-primary), 0 4px 16px rgba(0,0,0,0.12)'
          : '0 2px 8px rgba(0,0,0,0.08)',
      };

  return (
    <div
      className="rounded-card text-center font-body text-[13px] font-medium leading-snug transition-transform duration-200 hover:scale-[1.02]"
      style={{ ...baseStyle, wordBreak: 'break-word', maxWidth: 240 }}
    >
      <Handle
        type="target"
        position={targetPosition || Position.Top}
        isConnectable
      />
      <div>{data.label}</div>
      <div
        className={`mx-auto mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(status)}`}
      >
        {statusLabel(status)}
      </div>
      <Handle
        type="source"
        position={sourcePosition || Position.Bottom}
        isConnectable
      />
    </div>
  );
}

export default memo(ConceptNode);
