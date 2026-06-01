// React Flow canvas wrapper. Pure renderer — state lives in the workspace.

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ConceptNode from './ConceptNode';
import RelationshipEdge from './RelationshipEdge';
import { FLOW_CONFIG, EDGE_HIGHLIGHT_COLOR } from '../../config/constants';

export default function MapCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeContextMenu,
  onPaneClick,
  onNodeDragStop,
  onConnect,
}) {
  const nodeTypes = useMemo(() => ({ concept: ConceptNode }), []);
  const edgeTypes = useMemo(() => ({ relationship: RelationshipEdge }), []);

  // Default arrowhead marker on every edge.
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'relationship',
      markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_HIGHLIGHT_COLOR },
    }),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onNodeContextMenu={onNodeContextMenu}
      onPaneClick={onPaneClick}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      minZoom={FLOW_CONFIG.minZoom}
      maxZoom={FLOW_CONFIG.maxZoom}
      panOnDrag
      zoomOnScroll
      proOptions={{ hideAttribution: true }}
      className="bg-bg-secondary"
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
    </ReactFlow>
  );
}
