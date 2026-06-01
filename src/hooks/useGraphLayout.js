// Hook wrapping dagre layout computation for the current graph.

import { useCallback } from 'react';
import { layoutGraph } from '../services/layoutService';

export function useGraphLayout() {
  // Returns a new nodes array positioned by dagre. Edges are unchanged.
  const applyLayout = useCallback((nodes, edges, direction) => {
    return layoutGraph(nodes, edges, direction);
  }, []);

  return { applyLayout };
}
