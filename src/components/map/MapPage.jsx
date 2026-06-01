// Full map page: orchestrates graph state, learning modes, AI calls, and layout.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import toast from 'react-hot-toast';

import MapNavbar from './MapNavbar';
import MapToolbar from './MapToolbar';
import MapCanvas from './MapCanvas';
import StatusBar from './StatusBar';
import ZoomControls from './ZoomControls';
import NodeContextMenu from './NodeContextMenu';
import EdgeInfoPopup from './EdgeInfoPopup';
import DetailPanel from './DetailPanel';
import ProgressDashboard from './ProgressDashboard';
import RevisionDashboard from './RevisionDashboard';
import QuizModal from './QuizModal';
import FlashcardModal from './FlashcardModal';
import AttachmentsPanel from './AttachmentsPanel';
import ManualEditModal from './ManualEditModal';
import NoteModal from './NoteModal';
import ImagePreviewModal from './ImagePreviewModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import SaveMapModal from '../modals/SaveMapModal';
import OpenMapModal from '../modals/OpenMapModal';
import ShortcutsModal from '../modals/ShortcutsModal';

import { useMap } from '../../context/MapContext';
import { useTheme } from '../../context/ThemeContext';
import { useAI } from '../../hooks/useAI';
import { useGraphLayout } from '../../hooks/useGraphLayout';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

import {
  buildInitialGraph,
  buildExpansion,
  createEdge,
  createManualNode,
  getConnectedEdgeIds,
} from '../../utils/graphUtils';
import {
  computeProgress,
  getCachedMap,
  getCachedImageAnalysis,
  setCachedMap,
  setCachedImageAnalysis,
  updateNodeStatus,
} from '../../utils/learningUtils';
import { getClosestDemoMap } from '../../data/demoMaps';
import {
  EXPANSION_LIMIT,
  IMAGE_ANALYSIS_LIMIT,
  LEARNING_STATUSES,
  NOTE_GENERATION_LIMIT,
} from '../../config/constants';
import * as storageService from '../../services/storageService';
import * as exportService from '../../services/exportService';

const closedModals = {
  save: false,
  open: false,
  shortcuts: false,
  quiz: false,
  flashcards: false,
  attachments: false,
  note: false,
  manualNode: false,
  connect: false,
};

function clampMenuPosition(clientX, clientY) {
  const menuWidth = 264;
  const menuHeight = 430;
  const padding = 8;
  return {
    x: Math.max(padding, Math.min(clientX, window.innerWidth - menuWidth - padding)),
    y: Math.max(padding, Math.min(clientY, window.innerHeight - menuHeight - padding)),
  };
}

function firstLine(text = '') {
  return text.split('\n').find(Boolean) || 'Saved note';
}

function MapWorkspace() {
  const { state, actions } = useMap();
  const { toggleTheme } = useTheme();
  const ai = useAI();
  const { applyLayout } = useGraphLayout();
  const reactFlow = useReactFlow();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const didInit = useRef(false);

  const [savedMaps, setSavedMaps] = useState([]);
  const [modals, setModals] = useState(closedModals);
  const [noteInitial, setNoteInitial] = useState({});
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fitSoon = useCallback(() => {
    setTimeout(() => reactFlow.fitView({ padding: 0.2, duration: 400 }), 50);
  }, [reactFlow]);

  const graphCenterPosition = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const screenPoint = {
      x: (rect?.left || 0) + (rect?.width || window.innerWidth) / 2,
      y: (rect?.top || 0) + (rect?.height || window.innerHeight) / 2,
    };
    return reactFlow.screenToFlowPosition?.(screenPoint) || { x: 120, y: 120 };
  }, [reactFlow]);

  const progress = useMemo(() => computeProgress(state.nodes), [state.nodes]);

  const setLearningStatus = useCallback(
    (nodeId, status) => {
      const updated = updateNodeStatus(state.nodes, nodeId, status);
      actions.setNodes(updated);
      actions.markUnsaved();
      const refreshed = updated.find((node) => node.id === nodeId);
      if (refreshed && state.detailNode?.id === nodeId) {
        actions.showDetail({
          ...state.detailNode,
          learningStatus: refreshed.data.learningStatus,
        });
      }
    },
    [state.nodes, state.detailNode, actions]
  );

  const showDetails = useCallback(
    (nodeId) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const labelById = new Map(state.nodes.map((n) => [n.id, n.data.label]));
      const linkedNote = state.notes.find((note) => note.id === node.data.noteId);
      const linkedImage = state.attachments.find((image) => image.id === node.data.imageId);
      actions.showDetail({
        id: node.id,
        kind: node.data.kind || 'concept',
        noteId: node.data.noteId,
        imageId: node.data.imageId,
        label: linkedNote?.title || node.data.label,
        parentLabel: node.data.parentLabel,
        summary: linkedNote?.text || linkedImage?.extractedSummary || node.data.summary,
        analogy: node.data.analogy,
        example: node.data.example,
        whyItMatters: node.data.whyItMatters,
        commonMistake: node.data.commonMistake,
        prerequisites: node.data.prerequisites,
        attachedImageIds: [
          ...(node.data.imageId ? [node.data.imageId] : []),
          ...(node.data.attachedImageIds || []),
        ],
        attachedNoteIds: [
          ...(node.data.noteId ? [node.data.noteId] : []),
          ...(node.data.attachedNoteIds || []),
        ],
        prerequisiteLabels: (node.data.prerequisites || [])
          .map((id) => labelById.get(String(id)))
          .filter(Boolean),
        learningStatus: node.data.learningStatus,
        isUserCreated: node.data.isUserCreated,
        flashcards: node.data.flashcards,
        quiz: node.data.quiz,
      });
    },
    [state.nodes, state.notes, state.attachments, actions]
  );

  const generate = useCallback(
    async (topicArg) => {
      const topic = (topicArg ?? state.topic).trim();
      if (!topic) {
        toast.error('Enter a topic first.');
        return;
      }

      actions.setTopic(topic);
      actions.setGenerating(true);
      try {
        let aiData = getCachedMap(topic, state.settings);
        if (aiData) {
          toast.success('Loaded cached learning map');
        } else {
          try {
            aiData = await ai.generateMap(topic, state.settings);
            setCachedMap(topic, state.settings, aiData);
          } catch {
            toast('AI generation is unavailable. Loading a saved demo learning map.');
            aiData = getClosestDemoMap(topic);
          }
        }

        const { nodes, edges } = buildInitialGraph(aiData);
        const laid = applyLayout(nodes, edges, state.layoutDirection);
        actions.setGraph({
          nodes: laid,
          edges,
          topic: aiData.topic || topic,
          settings: state.settings,
          attachments: [],
          notes: [],
          mapId: null,
        });
        fitSoon();
        toast.success(`Ready to study ${nodes.length} concepts`);
      } catch {
        toast.error('Could not load a learning map.');
      } finally {
        actions.setGenerating(false);
      }
    },
    [state.topic, state.settings, state.layoutDirection, ai, actions, applyLayout, fitSoon]
  );

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const incoming = location.state?.topic;
    if (incoming && state.nodes.length === 0) generate(incoming);
    else {
      const draft = storageService.loadCurrentMapDraft();
      if (draft?.nodes?.length) {
        actions.setGraph({
          nodes: draft.nodes,
          edges: draft.edges || [],
          attachments: draft.attachments || [],
          notes: draft.notes || [],
          topic: draft.topic || '',
          settings: draft.settings,
          layoutDirection: draft.layoutDirection || 'TB',
          mapId: draft.mapId || null,
          hasUnsavedChanges: draft.hasUnsavedChanges || false,
          expansionCount: draft.expansionCount || 0,
          imageAnalysisCount: draft.imageAnalysisCount || 0,
          noteGenerationCount: draft.noteGenerationCount || 0,
        });
        fitSoon();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.nodes.length) return;
    storageService.saveCurrentMapDraft({
      mapId: state.mapId,
      topic: state.topic,
      settings: state.settings,
      nodes: state.nodes,
      edges: state.edges,
      attachments: state.attachments,
      notes: state.notes,
      layoutDirection: state.layoutDirection,
      hasUnsavedChanges: state.hasUnsavedChanges,
      expansionCount: state.expansionCount,
      imageAnalysisCount: state.imageAnalysisCount,
      noteGenerationCount: state.noteGenerationCount,
    });
  }, [
    state.mapId,
    state.topic,
    state.settings,
    state.nodes,
    state.edges,
    state.attachments,
    state.notes,
    state.layoutDirection,
    state.hasUnsavedChanges,
    state.expansionCount,
    state.imageAnalysisCount,
    state.noteGenerationCount,
  ]);

  const onNodesChange = useCallback(
    (changes) => actions.setNodes(applyNodeChanges(changes, state.nodes)),
    [state.nodes, actions]
  );
  const onEdgesChange = useCallback(
    (changes) => actions.setEdges(applyEdgeChanges(changes, state.edges)),
    [state.edges, actions]
  );
  const onNodeDragStop = useCallback(() => actions.markUnsaved(), [actions]);

  const onNodeClick = useCallback(
    (_event, node) => {
      actions.selectNode(node.id);
      actions.hideEdgeInfo();
      showDetails(node.id);
    },
    [actions, showDetails]
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      const position = clampMenuPosition(event.clientX, event.clientY);
      actions.selectNode(node.id);
      actions.hideEdgeInfo();
      actions.showContextMenu({
        nodeId: node.id,
        label: node.data.label,
        depth: node.data.depth,
        kind: node.data.kind || 'concept',
        position,
        source: 'context',
      });
    },
    [actions]
  );

  const onPaneClick = useCallback(() => actions.clearSelection(), [actions]);

  const expand = useCallback(
    async (nodeId) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      if (state.expansionCount >= EXPANSION_LIMIT) {
        toast('Expansion limit reached for this map. You can continue studying using quizzes, flashcards, and revision mode.');
        return;
      }

      try {
        const aiData = await ai.expandNode(
          node.data.label,
          state.topic,
          node.data.depth,
          node.id
        );
        const { newNodes, newEdges } = buildExpansion(aiData, {
          parentId: node.id,
          parentLabel: node.data.label,
          parentDepth: node.data.depth,
        });
        const combinedNodes = [...state.nodes, ...newNodes];
        const combinedEdges = [...state.edges, ...newEdges];
        const laid = applyLayout(combinedNodes, combinedEdges, state.layoutDirection);
        actions.setNodes(laid);
        actions.setEdges(combinedEdges);
        actions.incrementExpansion();
        actions.markUnsaved();
        fitSoon();
        toast.success(
          `Added ${newNodes.length} concepts. ${EXPANSION_LIMIT - state.expansionCount - 1} expansions left.`
        );
      } catch {
        /* handled in useAI */
      }
    },
    [
      state.nodes,
      state.edges,
      state.topic,
      state.layoutDirection,
      state.expansionCount,
      ai,
      actions,
      applyLayout,
      fitSoon,
    ]
  );

  const createRelationship = useCallback(
    ({ source, target, label }) => {
      if (!source || !target || source === target) return;
      const sourceNode = state.nodes.find((node) => node.id === source);
      const targetNode = state.nodes.find((node) => node.id === target);
      const sourceKind = sourceNode?.data.kind || 'concept';
      const targetKind = targetNode?.data.kind || 'concept';
      const fallbackLabel =
        sourceKind === 'concept' && targetKind === 'note'
          ? 'explained by'
          : sourceKind === 'note' && targetKind === 'concept'
            ? 'supports'
            : sourceKind === 'image' && targetKind === 'concept'
              ? 'visualizes'
              : sourceKind === 'concept' && targetKind === 'image'
                ? 'shown in'
                : 'related to';
      const edge = createEdge({ source, target, label: label || fallbackLabel });
      actions.setEdges([...state.edges, edge]);
      actions.markUnsaved();
      toast.success('Connection added');
    },
    [state.nodes, state.edges, actions]
  );

  const materialPositionNear = useCallback(
    (conceptId) => {
      const concept = state.nodes.find((node) => node.id === conceptId);
      if (!concept?.position) return graphCenterPosition();
      const existingCount = state.edges.filter((edge) => edge.source === conceptId || edge.target === conceptId).length;
      return {
        x: concept.position.x + 220 + (existingCount % 3) * 28,
        y: concept.position.y + 80 + Math.floor(existingCount / 3) * 90,
      };
    },
    [state.nodes, state.edges, graphCenterPosition]
  );

  const handleEdgeLabelClick = useCallback(
    async (edgeId) => {
      const edge = state.edges.find((e) => e.id === edgeId);
      if (!edge) return;
      const source = state.nodes.find((n) => n.id === edge.source);
      const target = state.nodes.find((n) => n.id === edge.target);
      const rect = containerRef.current?.getBoundingClientRect();
      const baseInfo = {
        label: edge.data.label,
        edgeId,
        sourceLabel: source?.data.label || '',
        targetLabel: target?.data.label || '',
        position: {
          x: Math.min((rect?.width || 0) / 2, (rect?.width || 0) - 340),
          y: 120,
        },
      };
      actions.selectNode(null);
      actions.hideContextMenu();

      if (edge.data.description) {
        actions.showEdgeInfo({ ...baseInfo, description: edge.data.description });
        return;
      }
      actions.showEdgeInfo({ ...baseInfo, description: '', loading: false });
    },
    [state.edges, state.nodes, actions]
  );

  const realign = useCallback(() => {
    if (state.nodes.length === 0) return;
    const laid = applyLayout(state.nodes, state.edges, state.layoutDirection);
    actions.setNodes(laid);
    fitSoon();
    toast.success('Graph re-aligned');
  }, [state.nodes, state.edges, state.layoutDirection, applyLayout, actions, fitSoon]);

  const toggleLayout = useCallback(() => {
    const next = state.layoutDirection === 'TB' ? 'LR' : 'TB';
    actions.setLayout(next);
    if (state.nodes.length > 0) {
      const laid = applyLayout(state.nodes, state.edges, next);
      actions.setNodes(laid);
      fitSoon();
    }
  }, [state.layoutDirection, state.nodes, state.edges, applyLayout, actions, fitSoon]);

  const openSave = useCallback(() => {
    if (state.nodes.length === 0) {
      toast.error('Nothing to save yet.');
      return;
    }
    setModals((m) => ({ ...m, save: true }));
  }, [state.nodes.length]);

  const handleSave = useCallback(
    (title) => {
      const saved = storageService.saveMap({
        id: state.mapId,
        title,
        topic: state.topic,
        nodes: state.nodes,
        edges: state.edges,
        layoutDirection: state.layoutDirection,
        settings: state.settings,
        attachments: state.attachments,
        notes: state.notes,
      });
      actions.markSaved({ mapId: saved.id, topic: saved.topic });
      setModals((m) => ({ ...m, save: false }));
      toast.success('Map saved!');
    },
    [state, actions]
  );

  const openOpen = useCallback(() => {
    setSavedMaps(storageService.loadMaps());
    setModals((m) => ({ ...m, open: true }));
  }, []);

  const handleOpenMap = useCallback(
    (map) => {
      actions.setGraph({
        nodes: map.nodes,
        edges: map.edges,
        topic: map.topic,
        settings: map.settings,
        attachments: map.attachments || [],
        notes: map.notes || [],
        mapId: map.id,
        layoutDirection: map.layoutDirection || 'TB',
        hasUnsavedChanges: false,
      });
      setModals((m) => ({ ...m, open: false }));
      fitSoon();
      toast.success(`Opened "${map.title}"`);
    },
    [actions, fitSoon]
  );

  const handleDeleteMap = useCallback((id) => {
    setSavedMaps(storageService.deleteMap(id));
    toast.success('Map deleted');
  }, []);

  const handleExport = useCallback(
    async (format) => {
      if (state.nodes.length === 0) {
        toast.error('Nothing to export yet.');
        return;
      }
      try {
        if (format === 'png') await exportService.exportPng(state.topic);
        else if (format === 'svg') await exportService.exportSvg(state.topic);
        else exportService.exportJson(state.topic, state.nodes, state.edges, state.layoutDirection);
        toast.success('Export complete');
      } catch (err) {
        toast.error(err.message || 'Export failed.');
      }
    },
    [state.topic, state.nodes, state.edges, state.layoutDirection]
  );

  const onFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!document.fullscreenElement && el) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  const onEscape = useCallback(() => {
    if (
      modals.save ||
      modals.open ||
      modals.shortcuts ||
      modals.quiz ||
      modals.flashcards ||
      modals.attachments ||
      modals.note ||
      modals.manualNode ||
      modals.connect
    ) {
      setModals(closedModals);
      return;
    }
    if (state.detailNode) actions.hideDetail();
    else if (state.edgeInfo) actions.hideEdgeInfo();
    else actions.clearSelection();
  }, [modals, state.detailNode, state.edgeInfo, actions]);

  const shortcutHandlers = useMemo(
    () => ({
      onFit: () => reactFlow.fitView({ padding: 0.2, duration: 400 }),
      onRealign: realign,
      onToggleLayout: toggleLayout,
      onZoomIn: () => reactFlow.zoomIn(),
      onZoomOut: () => reactFlow.zoomOut(),
      onToggleTheme: toggleTheme,
      onShowShortcuts: () => setModals((m) => ({ ...m, shortcuts: true })),
      onSave: openSave,
      onOpen: openOpen,
      onExportPng: () => handleExport('png'),
      onExportSvg: () => handleExport('svg'),
      onEscape,
    }),
    [reactFlow, realign, toggleLayout, toggleTheme, openSave, openOpen, handleExport, onEscape]
  );
  useKeyboardShortcuts(shortcutHandlers);

  const highlightedEdgeIds = useMemo(
    () => (state.selectedNode ? getConnectedEdgeIds(state.edges, state.selectedNode) : []),
    [state.selectedNode, state.edges]
  );

  const displayEdges = useMemo(
    () =>
      state.edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          highlighted: highlightedEdgeIds.includes(e.id),
          onLabelClick: handleEdgeLabelClick,
        },
      })),
    [state.edges, highlightedEdgeIds, handleEdgeLabelClick]
  );

  const readImageFile = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            id: crypto.randomUUID(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            lastModified: file.lastModified,
            sourceType: 'personal',
            localUrl: reader.result,
            createdAt: new Date().toISOString(),
          });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }),
    []
  );

  const uploadImages = useCallback(
    async (files, linkedNodeId) => {
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      const validFiles = files.filter((file) => allowed.includes(file.type));
      if (!validFiles.length) return;
      const loaded = await Promise.all(validFiles.map(readImageFile));
      actions.setAttachments([...state.attachments, ...loaded]);
      if (linkedNodeId) {
        const imageIds = loaded.map((attachment) => attachment.id);
        actions.setNodes(
          state.nodes.map((node) =>
            node.id === linkedNodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    attachedImageIds: [
                      ...new Set([...(node.data.attachedImageIds || []), ...imageIds]),
                    ],
                  },
                }
              : node
          )
        );
      }
      toast.success(`Attached ${loaded.length} image${loaded.length === 1 ? '' : 's'}`);
    },
    [state.attachments, state.nodes, actions, readImageFile]
  );

  const toggleNodeImage = useCallback(
    (nodeId, imageId) => {
      actions.setNodes(
        state.nodes.map((node) => {
          if (node.id !== nodeId) return node;
          const current = node.data.attachedImageIds || [];
          const next = current.includes(imageId)
            ? current.filter((id) => id !== imageId)
            : [...current, imageId];
          return { ...node, data: { ...node.data, attachedImageIds: next } };
        })
      );
      actions.markUnsaved();
      if (state.detailNode?.id === nodeId) {
        const current = state.detailNode.attachedImageIds || [];
        actions.showDetail({
          ...state.detailNode,
          attachedImageIds: current.includes(imageId)
            ? current.filter((id) => id !== imageId)
            : [...current, imageId],
        });
      }
    },
    [state.nodes, state.detailNode, actions]
  );

  const toggleNodeNote = useCallback(
    (nodeId, noteId) => {
      actions.setNodes(
        state.nodes.map((node) => {
          if (node.id !== nodeId) return node;
          const current = node.data.attachedNoteIds || [];
          const next = current.includes(noteId)
            ? current.filter((id) => id !== noteId)
            : [...current, noteId];
          return { ...node, data: { ...node.data, attachedNoteIds: next } };
        })
      );
      actions.markUnsaved();
      if (state.detailNode?.id === nodeId) {
        const current = state.detailNode.attachedNoteIds || [];
        actions.showDetail({
          ...state.detailNode,
          attachedNoteIds: current.includes(noteId)
            ? current.filter((id) => id !== noteId)
            : [...current, noteId],
        });
      }
    },
    [state.nodes, state.detailNode, actions]
  );

  const updateAttachment = useCallback(
    (id, patch) => {
      actions.setAttachments(
        state.attachments.map((attachment) =>
          attachment.id === id ? { ...attachment, ...patch } : attachment
        )
      );
    },
    [state.attachments, actions]
  );

  const removeAttachment = useCallback(
    (id) => {
      actions.setAttachments(state.attachments.filter((attachment) => attachment.id !== id));
      actions.setNodes(
        state.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            attachedImageIds: (node.data.attachedImageIds || []).filter((imageId) => imageId !== id),
          },
        }))
      );
    },
    [state.attachments, state.nodes, actions]
  );

  const addSuggestedNodes = useCallback(
    (source) => {
      const suggestedNodes = source.suggestedNodes || [];
      if (!suggestedNodes.length) return;
      const newNodes = suggestedNodes.map((suggestion) =>
        createManualNode({
          title: suggestion.title,
          summary: suggestion.summary,
          sourceIds: [source.id],
        })
      );
      const labelToId = new Map([
        ...state.nodes.map((node) => [node.data.label.toLowerCase(), node.id]),
        ...newNodes.map((node) => [node.data.label.toLowerCase(), node.id]),
      ]);
      const newEdges = (source.suggestedEdges || [])
        .map((edge) => {
          const sourceId = labelToId.get((edge.sourceTitle || '').toLowerCase());
          const targetId = labelToId.get((edge.targetTitle || '').toLowerCase());
          if (!sourceId || !targetId || sourceId === targetId) return null;
          return createEdge({ source: sourceId, target: targetId, label: edge.label || 'relates to' });
        })
        .filter(Boolean);
      const combinedEdges = [...state.edges, ...newEdges];
      const laid = applyLayout([...state.nodes, ...newNodes], combinedEdges, state.layoutDirection);
      actions.setNodes(laid);
      actions.setEdges(combinedEdges);
      actions.markUnsaved();
      fitSoon();
      toast.success(`Added ${newNodes.length} suggested nodes`);
    },
    [state.nodes, state.edges, state.layoutDirection, actions, applyLayout, fitSoon]
  );

  const analyzeAttachment = useCallback(
    async (attachment) => {
      const cached = getCachedImageAnalysis(attachment);
      if (cached) {
        updateAttachment(attachment.id, {
          extractedText: cached.extractedText,
          extractedSummary: cached.summary,
          keyConcepts: cached.keyConcepts || [],
          suggestedNodes: cached.suggestedNodes,
          suggestedEdges: cached.suggestedEdges,
          analyzedAt: cached.analyzedAt || cached.cachedAt,
        });
        toast.success('Loaded cached image analysis');
        return;
      }
      if (state.imageAnalysisCount >= IMAGE_ANALYSIS_LIMIT) {
        toast('Image analysis limit reached for this map session.');
        return;
      }
      try {
        const result = await ai.analyzeImageAttachment(attachment);
        setCachedImageAnalysis(attachment, result);
        updateAttachment(attachment.id, {
          extractedText: result.extractedText || '',
          extractedSummary: result.summary || '',
          keyConcepts: result.keyConcepts || [],
          suggestedNodes: result.suggestedNodes || [],
          suggestedEdges: result.suggestedEdges || [],
          analyzedAt: new Date().toISOString(),
        });
        actions.incrementImageAnalysis();
        toast.success('Image analysis saved');
      } catch {
        toast('AI extraction is unavailable. You can still attach this image and add notes manually.');
      }
    },
    [state.imageAnalysisCount, ai, actions, updateAttachment]
  );

  const openNote = useCallback((initial = {}) => {
    setNoteInitial(initial);
    setModals((m) => ({ ...m, note: true }));
  }, []);

  const saveNote = useCallback(
    (draft) => {
      if (!draft.text?.trim()) return;
      const now = new Date().toISOString();
      const note = {
        id: crypto.randomUUID(),
        title: firstLine(draft.text.trim()),
        text: draft.text.trim(),
        linkedNodeId: draft.linkedNodeId,
        sourceType: draft.sourceType,
        createdAt: now,
        updatedAt: now,
      };
      actions.setNotes([
        ...state.notes,
        note,
      ]);
      if (draft.linkedNodeId) {
        setTimeout(() => toggleNodeNote(draft.linkedNodeId, note.id), 0);
      }
      setModals((m) => ({ ...m, note: false }));
      toast.success('Note saved');
    },
    [state.notes, actions, toggleNodeNote]
  );

  const generateFromNote = useCallback(
    async (draft) => {
      if (!draft.text?.trim()) return;
      if (state.noteGenerationCount >= NOTE_GENERATION_LIMIT) {
        toast('Note generation limit reached for this map session.');
        return;
      }
      const note = {
        id: crypto.randomUUID(),
        text: draft.text.trim(),
        linkedNodeId: draft.linkedNodeId,
        sourceType: draft.sourceType,
        createdAt: new Date().toISOString(),
      };
      try {
        const result = await ai.generateFromNote(note, { topic: state.topic, nodes: state.nodes });
        actions.incrementNoteGeneration();
        actions.setNotes([...state.notes, note]);
        addSuggestedNodes({
          id: note.id,
          suggestedNodes: result.suggestedNodes || [],
          suggestedEdges: result.suggestedEdges || [],
        });
        setModals((m) => ({ ...m, note: false }));
      } catch {
        toast('AI note generation is unavailable. Your note can still be saved manually.');
      }
    },
    [state.noteGenerationCount, state.topic, state.nodes, state.notes, ai, actions, addSuggestedNodes]
  );

  const addManualNode = useCallback(
    ({ title, summary }) => {
      if (!title?.trim()) return;
      const node = createManualNode({ title: title.trim(), summary });
      const laid = applyLayout([...state.nodes, node], state.edges, state.layoutDirection);
      actions.setNodes(laid);
      actions.markUnsaved();
      fitSoon();
    },
    [state.nodes, state.edges, state.layoutDirection, actions, applyLayout, fitSoon]
  );

  const addNoteNode = useCallback(
    (note, conceptId = null) => {
      const existing = state.nodes.find((node) => node.data.kind === 'note' && node.data.noteId === note.id);
      if (existing) {
        if (conceptId && !state.edges.some((edge) => edge.source === conceptId && edge.target === existing.id)) {
          createRelationship({ source: conceptId, target: existing.id, label: 'has note' });
        }
        showDetails(existing.id);
        return;
      }
      const title = note.title || firstLine(note.text);
      const node = createManualNode({
        title,
        summary: note.text,
        sourceIds: [note.id],
      });
      node.position = conceptId ? materialPositionNear(conceptId) : graphCenterPosition();
      node.data = {
        ...node.data,
        kind: 'note',
        noteId: note.id,
        label: title,
        title,
        isUserCreated: true,
      };
      actions.setNodes([...state.nodes, node]);
      if (conceptId) {
        actions.setEdges([...state.edges, createEdge({ source: conceptId, target: node.id, label: 'has note' })]);
      }
      actions.markUnsaved();
      toast.success('Note added to map');
    },
    [state.nodes, state.edges, actions, graphCenterPosition, materialPositionNear, createRelationship, showDetails]
  );

  const addImageNode = useCallback(
    (image, conceptId = null) => {
      const existing = state.nodes.find((node) => node.data.kind === 'image' && node.data.imageId === image.id);
      if (existing) {
        if (conceptId && !state.edges.some((edge) => edge.source === conceptId && edge.target === existing.id)) {
          createRelationship({ source: conceptId, target: existing.id, label: 'has visual' });
        }
        showDetails(existing.id);
        return;
      }
      const node = createManualNode({
        title: image.userNote || image.fileName,
        summary: image.extractedSummary || image.userNote || '',
        sourceIds: [image.id],
      });
      node.position = conceptId ? materialPositionNear(conceptId) : graphCenterPosition();
      node.data = {
        ...node.data,
        kind: 'image',
        imageId: image.id,
        label: image.userNote || image.fileName,
        title: image.userNote || image.fileName,
        thumbnailUrl: image.localUrl,
        sourceType: image.sourceType,
        isUserCreated: true,
      };
      actions.setNodes([...state.nodes, node]);
      if (conceptId) {
        actions.setEdges([...state.edges, createEdge({ source: conceptId, target: node.id, label: 'has visual' })]);
      }
      actions.markUnsaved();
      toast.success('Image added to map');
    },
    [state.nodes, state.edges, actions, graphCenterPosition, materialPositionNear, createRelationship, showDetails]
  );

  const connectNodes = useCallback(
    ({ source, target, label }) => {
      createRelationship({ source, target, label: label || 'related to' });
    },
    [createRelationship]
  );

  const updateManualNode = useCallback(
    (nodeId, patch) => {
      const updated = state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...patch } } : node
      );
      actions.setNodes(updated);
      actions.markUnsaved();
      const refreshed = updated.find((node) => node.id === nodeId);
      if (refreshed) showDetails(refreshed.id);
    },
    [state.nodes, actions, showDetails]
  );

  const deleteManualNode = useCallback(
    (nodeId) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node?.data.isUserCreated && node?.data.kind !== 'note' && node?.data.kind !== 'image') return;
      actions.setNodes(state.nodes.filter((n) => n.id !== nodeId));
      actions.setEdges(state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      actions.hideDetail();
      actions.markUnsaved();
    },
    [state.nodes, state.edges, actions]
  );

  const attachImageSummaryToNode = useCallback(
    (nodeId, image) => {
      const text = image.extractedSummary || '';
      if (!text) return;
      actions.setNodes(
        state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  summary: node.data.summary ? `${node.data.summary}\n\nImage note: ${text}` : text,
                  sourceIds: [...new Set([...(node.data.sourceIds || []), image.id])],
                },
              }
            : node
        )
      );
      actions.markUnsaved();
      toast.success('Image summary attached to node');
    },
    [state.nodes, actions]
  );

  const updateEdgeLabel = useCallback(
    (edgeId, label) => {
      actions.setEdges(
        state.edges.map((edge) =>
          edge.id === edgeId ? { ...edge, data: { ...edge.data, label } } : edge
        )
      );
      if (state.edgeInfo?.edgeId === edgeId) {
        actions.showEdgeInfo({ ...state.edgeInfo, label });
      }
      actions.markUnsaved();
    },
    [state.edges, state.edgeInfo, actions]
  );

  const handleMenuAction = useCallback(
    (action) => {
      const menu = state.contextMenu;
      if (!menu) return;
      actions.hideContextMenu();
      if (action === 'details' || action === 'edit-node') showDetails(menu.nodeId);
      else if (action === 'expand') expand(menu.nodeId);
      else if (action === 'add-note') openNote({ linkedNodeId: menu.nodeId });
      else if (action === 'attach-image') setModals((m) => ({ ...m, attachments: true }));
      else if (action === 'attach-to-concept') setModals((m) => ({ ...m, attachments: true }));
      else if (action === 'analyze-image') {
        const node = state.nodes.find((n) => n.id === menu.nodeId);
        const imageId = node?.data.imageId || node?.data.attachedImageIds?.[0];
        const image = state.attachments.find((attachment) => attachment.id === imageId);
        if (image) analyzeAttachment(image);
      } else if (action === 'delete-node') deleteManualNode(menu.nodeId);
      else if (action === 'start-connect') {
        setConnectingFrom({ nodeId: menu.nodeId, label: menu.label });
        toast.success(`Choose a target node for ${menu.label}`);
      } else if (action === 'finish-connect' && connectingFrom) {
        const label = window.prompt('Relationship label', 'related to') || 'related to';
        createRelationship({ source: connectingFrom.nodeId, target: menu.nodeId, label });
        setConnectingFrom(null);
      }
    },
    [
      state.contextMenu,
      state.nodes,
      state.attachments,
      actions,
      expand,
      showDetails,
      openNote,
      analyzeAttachment,
      deleteManualNode,
      connectingFrom,
      createRelationship,
    ]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <MapNavbar />
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-bg-secondary">
        <MapToolbar
          topic={state.topic}
          settings={state.settings}
          onTopicChange={actions.setTopic}
          onSettingsChange={actions.setSettings}
          onGenerate={() => generate()}
          onStartQuiz={() => setModals((m) => ({ ...m, quiz: true }))}
          onStartFlashcards={() => setModals((m) => ({ ...m, flashcards: true }))}
          onToggleAttachments={() => setModals((m) => ({ ...m, attachments: !m.attachments }))}
          onAddNote={() => openNote()}
          onAddNode={() => setModals((m) => ({ ...m, manualNode: true }))}
          onHome={() => navigate('/')}
          onSave={openSave}
          onOpen={openOpen}
          onRealign={realign}
          onToggleLayout={toggleLayout}
          onExport={handleExport}
          onShowShortcuts={() => setModals((m) => ({ ...m, shortcuts: true }))}
          onToggleTheme={toggleTheme}
          layoutDirection={state.layoutDirection}
          hasUnsavedChanges={state.hasUnsavedChanges}
          isGenerating={state.isGenerating}
        />

        <MapCanvas
          nodes={state.nodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          onConnect={(connection) => connectNodes(connection)}
        />

        {state.isGenerating && (
          <LoadingSpinner overlay label="Generating learning map..." size={32} />
        )}

        <NodeContextMenu
          menu={state.contextMenu}
          connectingFrom={connectingFrom}
          nodeKind={state.contextMenu?.kind || 'concept'}
          hasAttachedImage={
            !!state.nodes.find((node) => node.id === state.contextMenu?.nodeId)?.data.attachedImageIds?.length ||
            state.nodes.find((node) => node.id === state.contextMenu?.nodeId)?.data.kind === 'image'
          }
          onAction={handleMenuAction}
          onClose={actions.hideContextMenu}
        />
        <EdgeInfoPopup
          info={state.edgeInfo}
          onClose={actions.hideEdgeInfo}
          onUpdateLabel={updateEdgeLabel}
        />
        <DetailPanel
          detail={state.detailNode}
          notes={state.notes}
          attachments={state.attachments}
          onClose={actions.hideDetail}
          onStatusChange={setLearningStatus}
          onAddNote={openNote}
          onUploadImage={uploadImages}
          onUpdateNode={updateManualNode}
          onDeleteNode={deleteManualNode}
          onToggleNodeImage={toggleNodeImage}
          onToggleNodeNote={toggleNodeNote}
          onAnalyzeImage={analyzeAttachment}
          onPreviewImage={setPreviewImage}
          onAddNoteNode={addNoteNode}
          onAddImageNode={addImageNode}
        />
        <AttachmentsPanel
          isOpen={modals.attachments}
          attachments={state.attachments}
          notes={state.notes}
          nodes={state.nodes}
          selectedConcept={state.nodes.find((node) => node.id === state.selectedNode && (node.data.kind || 'concept') === 'concept')}
          remainingAnalyses={IMAGE_ANALYSIS_LIMIT - state.imageAnalysisCount}
          onUpload={uploadImages}
          onUpdate={updateAttachment}
          onRemove={removeAttachment}
          onAnalyze={analyzeAttachment}
          onAddSuggestions={addSuggestedNodes}
          onToggleNodeImage={toggleNodeImage}
          onPreview={setPreviewImage}
          onAddImageNode={addImageNode}
          onAddNoteNode={addNoteNode}
          onAttachNoteToConcept={toggleNodeNote}
          onAttachImageToConcept={toggleNodeImage}
          onShowMaterialNode={showDetails}
        />
        <ProgressDashboard progress={progress} />
        <RevisionDashboard nodes={state.nodes} onOpenNode={showDetails} />

        <StatusBar nodeCount={state.nodeCount} edgeCount={state.edgeCount} />
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border-color bg-toolbar-bg px-3 py-1 text-xs text-text-secondary shadow-modal">
          {EXPANSION_LIMIT - state.expansionCount} expansions · {IMAGE_ANALYSIS_LIMIT - state.imageAnalysisCount} image AI · {NOTE_GENERATION_LIMIT - state.noteGenerationCount} note AI left
        </div>
        <ZoomControls
          onZoomIn={() => reactFlow.zoomIn()}
          onZoomOut={() => reactFlow.zoomOut()}
          onFit={() => reactFlow.fitView({ padding: 0.2, duration: 400 })}
          onFullscreen={onFullscreen}
        />

        <SaveMapModal
          isOpen={modals.save}
          onClose={() => setModals((m) => ({ ...m, save: false }))}
          defaultTitle={state.topic}
          onSave={handleSave}
        />
        <OpenMapModal
          isOpen={modals.open}
          onClose={() => setModals((m) => ({ ...m, open: false }))}
          maps={savedMaps}
          onOpen={handleOpenMap}
          onDelete={handleDeleteMap}
        />
        <ShortcutsModal
          isOpen={modals.shortcuts}
          onClose={() => setModals((m) => ({ ...m, shortcuts: false }))}
        />
        <QuizModal
          isOpen={modals.quiz}
          onClose={() => setModals((m) => ({ ...m, quiz: false }))}
          nodes={state.nodes}
          onAnswer={(nodeId, correct) =>
            setLearningStatus(
              nodeId,
              correct ? LEARNING_STATUSES.MASTERED : LEARNING_STATUSES.NEEDS_REVISION
            )
          }
        />
        <FlashcardModal
          isOpen={modals.flashcards}
          onClose={() => setModals((m) => ({ ...m, flashcards: false }))}
          nodes={state.nodes}
          onGrade={(nodeId, grade) => {
            if (grade === 'again') setLearningStatus(nodeId, LEARNING_STATUSES.NEEDS_REVISION);
            if (grade === 'easy') setLearningStatus(nodeId, LEARNING_STATUSES.MASTERED);
            if (grade === 'good') setLearningStatus(nodeId, LEARNING_STATUSES.LEARNING);
          }}
        />
        {modals.note && (
          <NoteModal
            isOpen={modals.note}
            nodes={state.nodes}
            initial={noteInitial}
            remainingGenerations={NOTE_GENERATION_LIMIT - state.noteGenerationCount}
            onClose={() => setModals((m) => ({ ...m, note: false }))}
            onSave={saveNote}
            onGenerate={generateFromNote}
          />
        )}
        <ManualEditModal
          isOpen={modals.manualNode}
          mode="node"
          nodes={state.nodes}
          onClose={() => setModals((m) => ({ ...m, manualNode: false }))}
          onAddNode={addManualNode}
          onConnect={connectNodes}
        />
        <ImagePreviewModal
          image={previewImage}
          nodes={state.nodes}
          onClose={() => setPreviewImage(null)}
          onAnalyze={analyzeAttachment}
          onToggleNodeImage={toggleNodeImage}
          onAddSuggestions={addSuggestedNodes}
          onAttachSummary={attachImageSummaryToNode}
        />
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <ReactFlowProvider>
      <MapWorkspace />
    </ReactFlowProvider>
  );
}
