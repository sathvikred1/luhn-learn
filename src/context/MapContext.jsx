// Global map state via useReducer. This reducer is the spine of all
// canvas interactions (generation, selection, expand, panels, layout).

import { createContext, useContext, useReducer, useCallback } from 'react';
import { DEFAULT_LAYOUT_DIRECTION, DEFAULT_MAP_SETTINGS } from '../config/constants';

const MapContext = createContext(null);

const initialState = {
  mapId: null, // id of the currently-loaded saved map (null = unsaved)
  topic: '',
  settings: DEFAULT_MAP_SETTINGS,
  nodes: [],
  edges: [],
  attachments: [],
  notes: [],
  selectedNode: null, // currently highlighted node id
  detailNode: null, // node data shown in the detail panel (null = closed)
  edgeInfo: null, // { edge, source, target } for info popup (null = closed)
  contextMenu: null, // { nodeId, label, depth, position }
  layoutDirection: DEFAULT_LAYOUT_DIRECTION,
  isGenerating: false,
  hasUnsavedChanges: false,
  expansionCount: 0,
  imageAnalysisCount: 0,
  noteGenerationCount: 0,
  nodeCount: 0,
  edgeCount: 0,
};

function withCounts(state) {
  return {
    ...state,
    nodeCount: state.nodes.length,
    edgeCount: state.edges.length,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TOPIC':
      return { ...state, topic: action.payload };

    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'SET_GRAPH':
      // Replace the whole graph (initial generation / open saved map).
      return withCounts({
        ...state,
        nodes: action.payload.nodes,
        edges: action.payload.edges,
        attachments: action.payload.attachments ?? state.attachments,
        notes: action.payload.notes ?? state.notes,
        topic: action.payload.topic ?? state.topic,
        settings: action.payload.settings ?? state.settings,
        mapId: action.payload.mapId ?? null,
        layoutDirection:
          action.payload.layoutDirection ?? state.layoutDirection,
        selectedNode: null,
        detailNode: null,
        edgeInfo: null,
        contextMenu: null,
        hasUnsavedChanges: action.payload.hasUnsavedChanges ?? false,
        expansionCount: action.payload.expansionCount ?? 0,
        imageAnalysisCount: action.payload.imageAnalysisCount ?? 0,
        noteGenerationCount: action.payload.noteGenerationCount ?? 0,
      });

    case 'SET_NODES':
      return withCounts({ ...state, nodes: action.payload });

    case 'SET_EDGES':
      return withCounts({ ...state, edges: action.payload });

    case 'SET_ATTACHMENTS':
      return { ...state, attachments: action.payload, hasUnsavedChanges: true };

    case 'SET_NOTES':
      return { ...state, notes: action.payload, hasUnsavedChanges: true };

    case 'ADD_GRAPH':
      // Append expansion results.
      return withCounts({
        ...state,
        nodes: [...state.nodes, ...action.payload.nodes],
        edges: [...state.edges, ...action.payload.edges],
        hasUnsavedChanges: true,
      });

    case 'SELECT_NODE':
      return { ...state, selectedNode: action.payload };

    case 'SHOW_DETAIL':
      return { ...state, detailNode: action.payload };

    case 'HIDE_DETAIL':
      return { ...state, detailNode: null };

    case 'SHOW_EDGE_INFO':
      return { ...state, edgeInfo: action.payload };

    case 'HIDE_EDGE_INFO':
      return { ...state, edgeInfo: null };

    case 'SHOW_CONTEXT_MENU':
      return { ...state, contextMenu: action.payload };

    case 'HIDE_CONTEXT_MENU':
      return { ...state, contextMenu: null };

    case 'TOGGLE_LAYOUT':
      return {
        ...state,
        layoutDirection: state.layoutDirection === 'TB' ? 'LR' : 'TB',
      };

    case 'SET_LAYOUT':
      return { ...state, layoutDirection: action.payload };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'MARK_UNSAVED':
      return { ...state, hasUnsavedChanges: true };

    case 'INCREMENT_EXPANSION':
      return { ...state, expansionCount: state.expansionCount + 1 };

    case 'INCREMENT_IMAGE_ANALYSIS':
      return { ...state, imageAnalysisCount: state.imageAnalysisCount + 1 };

    case 'INCREMENT_NOTE_GENERATION':
      return { ...state, noteGenerationCount: state.noteGenerationCount + 1 };

    case 'MARK_SAVED':
      return {
        ...state,
        hasUnsavedChanges: false,
        mapId: action.payload?.mapId ?? state.mapId,
        topic: action.payload?.topic ?? state.topic,
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedNode: null,
        contextMenu: null,
        edgeInfo: null,
      };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

export function MapProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Convenience action creators (stable identities).
  const actions = {
    setTopic: useCallback((t) => dispatch({ type: 'SET_TOPIC', payload: t }), []),
    setSettings: useCallback((s) => dispatch({ type: 'SET_SETTINGS', payload: s }), []),
    setGraph: useCallback((p) => dispatch({ type: 'SET_GRAPH', payload: p }), []),
    setNodes: useCallback((n) => dispatch({ type: 'SET_NODES', payload: n }), []),
    setEdges: useCallback((e) => dispatch({ type: 'SET_EDGES', payload: e }), []),
    setAttachments: useCallback((a) => dispatch({ type: 'SET_ATTACHMENTS', payload: a }), []),
    setNotes: useCallback((n) => dispatch({ type: 'SET_NOTES', payload: n }), []),
    addGraph: useCallback((p) => dispatch({ type: 'ADD_GRAPH', payload: p }), []),
    selectNode: useCallback((id) => dispatch({ type: 'SELECT_NODE', payload: id }), []),
    showDetail: useCallback((d) => dispatch({ type: 'SHOW_DETAIL', payload: d }), []),
    hideDetail: useCallback(() => dispatch({ type: 'HIDE_DETAIL' }), []),
    showEdgeInfo: useCallback((d) => dispatch({ type: 'SHOW_EDGE_INFO', payload: d }), []),
    hideEdgeInfo: useCallback(() => dispatch({ type: 'HIDE_EDGE_INFO' }), []),
    showContextMenu: useCallback((d) => dispatch({ type: 'SHOW_CONTEXT_MENU', payload: d }), []),
    hideContextMenu: useCallback(() => dispatch({ type: 'HIDE_CONTEXT_MENU' }), []),
    toggleLayout: useCallback(() => dispatch({ type: 'TOGGLE_LAYOUT' }), []),
    setLayout: useCallback((d) => dispatch({ type: 'SET_LAYOUT', payload: d }), []),
    setGenerating: useCallback((b) => dispatch({ type: 'SET_GENERATING', payload: b }), []),
    markUnsaved: useCallback(() => dispatch({ type: 'MARK_UNSAVED' }), []),
    incrementExpansion: useCallback(() => dispatch({ type: 'INCREMENT_EXPANSION' }), []),
    incrementImageAnalysis: useCallback(() => dispatch({ type: 'INCREMENT_IMAGE_ANALYSIS' }), []),
    incrementNoteGeneration: useCallback(() => dispatch({ type: 'INCREMENT_NOTE_GENERATION' }), []),
    markSaved: useCallback((p) => dispatch({ type: 'MARK_SAVED', payload: p }), []),
    clearSelection: useCallback(() => dispatch({ type: 'CLEAR_SELECTION' }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return (
    <MapContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within MapProvider');
  return ctx;
}
