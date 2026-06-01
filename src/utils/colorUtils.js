// Depth-based color assignment for concept nodes.
// Returns the set of CSS variable references for a given node depth.

export function getNodeColorsByDepth(depth) {
  if (depth === 0) {
    return {
      background: 'var(--node-root)',
      borderColor: 'var(--node-root)',
      text: 'var(--node-root-text)',
      isRoot: true,
    };
  }
  if (depth === 1) {
    return {
      background: 'var(--node-level1)',
      borderColor: 'var(--node-level1-border)',
      text: 'var(--node-level1-text)',
      isRoot: false,
    };
  }
  if (depth === 2) {
    return {
      background: 'var(--node-level2)',
      borderColor: 'var(--node-level2-border)',
      text: 'var(--node-level2-text)',
      isRoot: false,
    };
  }
  // depth 3+
  return {
    background: 'var(--node-level3)',
    borderColor: 'var(--node-level3-border)',
    text: 'var(--node-level3-text)',
    isRoot: false,
  };
}
