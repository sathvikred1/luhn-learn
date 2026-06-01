// Node/edge creation helpers and ID generation for the concept graph.
// Converts raw AI output into React Flow node/edge objects.

import { v4 as uuidv4 } from 'uuid';
import { LEARNING_STATUSES } from '../config/constants';

export function generateId() {
  return uuidv4();
}

// Build a React Flow node from raw concept data.
// `data` carries everything the custom ConceptNode + interactions need.
export function createNode({
  id,
  label,
  title,
  depth,
  parentId = null,
  parentLabel = null,
  summary = '',
  analogy = '',
  example = '',
  whyItMatters = '',
  commonMistake = '',
  prerequisites = [],
  difficulty = 'Beginner',
  learningStatus = LEARNING_STATUSES.NOT_STARTED,
  revisionPriority = 'medium',
  flashcards = [],
  quiz = [],
  learningOrder = 999,
  isUserCreated = false,
  sourceIds = [],
}) {
  const nodeLabel = label || title;
  return {
    id: id || generateId(),
    type: 'concept',
    position: { x: 0, y: 0 }, // dagre assigns real positions later
    draggable: true,
    data: {
      label: nodeLabel,
      title: nodeLabel,
      depth,
      parentId,
      parentLabel,
      summary,
      analogy,
      example,
      whyItMatters,
      commonMistake,
      prerequisites: prerequisites.map(String),
      difficulty,
      learningStatus,
      revisionPriority,
      flashcards,
      quiz,
      learningOrder,
      isUserCreated,
      sourceIds,
      attachedImageIds: [],
      attachedNoteIds: [],
    },
  };
}

// Build a React Flow edge from raw relationship data.
export function createEdge({ id, source, target, label, description = '' }) {
  return {
    id: id || `e-${source}-${target}-${generateId().slice(0, 8)}`,
    source,
    target,
    type: 'relationship',
    data: {
      label,
      description,
    },
  };
}

// Convert an initial-generation AI payload ({ nodes, edges }) into
// React Flow nodes/edges. Preserves the AI-provided ids so edges line up.
export function buildInitialGraph(aiData) {
  const learningOrder = aiData.learningOrder || aiData.learning_order || [];
  const nodes = (aiData.nodes || []).map((n) =>
    createNode({
      id: String(n.id),
      label: n.label || n.title,
      depth: Number(n.depth) || 0,
      summary: n.summary || '',
      analogy: n.analogy || '',
      example: n.example || '',
      whyItMatters: n.whyItMatters || n.why_it_matters || '',
      commonMistake: n.commonMistake || n.common_mistake || '',
      prerequisites: n.prerequisites || [],
      difficulty: n.difficulty || 'Beginner',
      learningStatus: n.learningStatus || n.learning_status || LEARNING_STATUSES.NOT_STARTED,
      revisionPriority: n.revisionPriority || n.revision_priority || 'medium',
      flashcards: n.flashcards || [],
      quiz: n.quiz || [],
      learningOrder:
        learningOrder.findIndex((id) => String(id) === String(n.id)) === -1
          ? 999
          : learningOrder.findIndex((id) => String(id) === String(n.id)),
    })
  );

  // Map of nodeId -> label, for parent breadcrumbs
  const labelById = {};
  nodes.forEach((n) => {
    labelById[n.id] = n.data.label;
  });

  const edges = (aiData.edges || []).map((e) =>
    createEdge({
      source: String(e.source),
      target: String(e.target),
      label: e.label,
      description: e.description || '',
    })
  );

  // Assign parent info from edges (first incoming edge wins)
  edges.forEach((e) => {
    const child = nodes.find((n) => n.id === e.target);
    if (child && !child.data.parentId) {
      child.data.parentId = e.source;
      child.data.parentLabel = labelById[e.source] || null;
    }
  });

  return { nodes, edges };
}

// Convert an expand-node AI payload into new nodes/edges, remapping any
// temp_ ids to fresh unique ids and wiring edges to the real parent id.
export function buildExpansion(aiData, { parentId, parentLabel, parentDepth }) {
  const idMap = {}; // temp id -> real id

  const newNodes = (aiData.nodes || []).map((n) => {
    const realId = generateId();
    idMap[String(n.id)] = realId;
    return createNode({
      id: realId,
      label: n.label || n.title,
      depth: Number(n.depth) || parentDepth + 1,
      parentId,
      parentLabel,
      summary: n.summary || '',
      analogy: n.analogy || '',
      example: n.example || '',
      whyItMatters: n.whyItMatters || '',
      commonMistake: n.commonMistake || '',
      prerequisites: [parentId, ...(n.prerequisites || [])],
      difficulty: n.difficulty || 'Intermediate',
      learningStatus: n.learningStatus || LEARNING_STATUSES.NOT_STARTED,
      revisionPriority: n.revisionPriority || 'medium',
      flashcards: n.flashcards || [
        { front: `What is ${n.label || n.title}?`, back: n.summary || 'A related concept in this map.' },
      ],
      quiz: n.quiz || [],
    });
  });

  const newEdges = (aiData.edges || []).map((e) => {
    // Source may be the real parent id or a temp id; target is usually temp.
    const source = idMap[String(e.source)] || parentId;
    const target = idMap[String(e.target)] || parentId;
    return createEdge({
      source,
      target,
      label: e.label,
      description: e.description || '',
    });
  });

  return { newNodes, newEdges };
}

// Returns ids of all edges connected to a given node.
export function getConnectedEdgeIds(edges, nodeId) {
  return edges
    .filter((e) => e.source === nodeId || e.target === nodeId)
    .map((e) => e.id);
}

export function createManualNode({ title, summary = '', sourceIds = [] }) {
  return createNode({
    id: generateId(),
    label: title,
    depth: 1,
    summary,
    analogy: '',
    example: '',
    whyItMatters: 'Added by the learner for this map.',
    commonMistake: '',
    prerequisites: [],
    revisionPriority: 'medium',
    isUserCreated: true,
    sourceIds,
  });
}
