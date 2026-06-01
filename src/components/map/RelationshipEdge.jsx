// Custom React Flow edge with a clickable relationship label at midpoint.

import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import { EDGE_HIGHLIGHT_COLOR } from '../../config/constants';

function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const highlighted = selected || data?.highlighted;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: highlighted ? EDGE_HIGHLIGHT_COLOR : 'var(--edge-color)',
          strokeWidth: highlighted ? 2.5 : 1.5,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <button
            type="button"
            className="nodrag nopan absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded border text-[11px] transition-colors"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: 'var(--edge-label-bg)',
              borderColor: highlighted
                ? EDGE_HIGHLIGHT_COLOR
                : 'var(--edge-label-border)',
              color: highlighted ? EDGE_HIGHLIGHT_COLOR : 'var(--edge-label-text)',
              padding: '2px 8px',
              pointerEvents: 'all',
            }}
            onClick={(e) => {
              e.stopPropagation();
              data.onLabelClick?.(id);
            }}
          >
            {data.label}
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(RelationshipEdge);
