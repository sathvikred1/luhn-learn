// Dagre graph layout calculation. Given nodes/edges and a direction,
// returns nodes with computed x/y positions for React Flow.

import dagre from '@dagrejs/dagre';
import { DAGRE_CONFIG, NODE_DIMENSIONS, LAYOUT_DIRECTION } from '../config/constants';

export function layoutGraph(nodes, edges, direction = LAYOUT_DIRECTION.VERTICAL) {
  if (!nodes || nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: DAGRE_CONFIG.nodesep,
    ranksep: DAGRE_CONFIG.ranksep,
    edgesep: DAGRE_CONFIG.edgesep,
  });

  nodes.forEach((node) => {
    const width = node.width || NODE_DIMENSIONS.width;
    const height = node.height || NODE_DIMENSIONS.height;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const isHorizontal = direction === LAYOUT_DIRECTION.HORIZONTAL;

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const width = node.width || NODE_DIMENSIONS.width;
    const height = node.height || NODE_DIMENSIONS.height;
    return {
      ...node,
      // React Flow positions are top-left; dagre gives center.
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    };
  });
}
