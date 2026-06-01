// App-wide constants: suggested topics, defaults, storage keys, depth styling.

export const APP_NAME = 'LuhnLearn';

// localStorage keys
export const STORAGE_KEYS = {
  SAVED_MAPS: 'luhnlearn_saved_maps',
  THEME: 'luhnlearn_theme',
  API_CONFIG: 'luhnlearn_api_config',
  MAP_CACHE: 'luhnlearn_learning_map_cache',
  CURRENT_MAP: 'luhnlearn_current_learning_map',
  IMAGE_ANALYSIS_CACHE: 'luhnlearn_image_analysis_cache',
};

export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Exam Mode',
  'Interview Mode',
];

export const LEARNING_GOALS = [
  'Understand basics',
  'Exam revision',
  'Interview preparation',
  'Project building',
  'Quick revision',
];

export const TIME_AVAILABLE_OPTIONS = ['15 min', '30 min', '1 hour', '1 week'];

export const DEFAULT_MAP_SETTINGS = {
  difficulty: 'Beginner',
  learningGoal: 'Understand basics',
  timeAvailable: '30 min',
};

export const LEARNING_STATUSES = {
  NOT_STARTED: 'not_started',
  LEARNING: 'learning',
  NEEDS_REVISION: 'needs_revision',
  MASTERED: 'mastered',
};

export const EXPANSION_LIMIT = 3;
export const IMAGE_ANALYSIS_LIMIT = 3;
export const NOTE_GENERATION_LIMIT = 5;

export const SOURCE_TYPES = [
  'class_photo',
  'website_screenshot',
  'youtube_screenshot',
  'lecture_slide',
  'textbook',
  'personal',
  'other',
];

export const NOTE_SOURCE_TYPES = [
  'personal_note',
  'class_note',
  'website_note',
  'youtube_note',
  'other',
];

// LLM / Gemini configuration
export const DEFAULT_MODEL = 'gemini-2.0-flash';
export const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
export const API_KEY_PLACEHOLDER = 'your_gemini_api_key_here';

// Common Gemini models offered in the model dropdown (plus a Custom option).
export const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
];

// Layout
export const LAYOUT_DIRECTION = {
  VERTICAL: 'TB',
  HORIZONTAL: 'LR',
};

export const DEFAULT_LAYOUT_DIRECTION = LAYOUT_DIRECTION.VERTICAL;

// Dagre layout tuning
export const DAGRE_CONFIG = {
  nodesep: 80,
  ranksep: 120,
  edgesep: 40,
};

// Approximate node dimensions used for layout calculations
export const NODE_DIMENSIONS = {
  width: 180,
  height: 60,
};

// React Flow canvas config
export const FLOW_CONFIG = {
  minZoom: 0.1,
  maxZoom: 2,
};

// Suggested topics on the landing page
export const SUGGESTED_TOPICS = [
  { emoji: '🔮', label: 'Quantum Physics' },
  { emoji: '🏛️', label: 'Roman Empire' },
  { emoji: '🤖', label: 'Machine Learning' },
  { emoji: '🧬', label: 'Human Biology' },
  { emoji: '🌍', label: 'Climate Change' },
  { emoji: '🚀', label: 'Space Exploration' },
];

// Feature cards for the "Why LuhnLearn?" section
export const FEATURES = [
  {
    emoji: '🧠',
    title: 'AI Learning Maps',
    description:
      'Turn any topic into a structured visual lesson with summaries, examples, analogies, and learning order.',
  },
  {
    emoji: '📝',
    title: 'Quiz & Flashcards',
    description:
      'Study from generated quizzes and flashcards without extra AI calls or waiting.',
  },
  {
    emoji: '🔗',
    title: 'Revision Path',
    description:
      'Track mastery, spot weak concepts, and get a recommended next concept from local progress logic.',
  },
  {
    emoji: '💾',
    title: 'API-Safe Study',
    description:
      'Reuse cached maps, fall back to demo lessons, and keep save/export workflows intact.',
  },
];

// Keyboard shortcuts reference (grouped for the shortcuts modal)
export const SHORTCUTS = {
  NAVIGATION: [
    { keys: ['F'], description: 'Fit graph to view' },
    { keys: ['R'], description: 'Re-align graph' },
    { keys: ['L'], description: 'Toggle layout direction' },
    { keys: ['+'], description: 'Zoom in' },
    { keys: ['−'], description: 'Zoom out' },
  ],
  FILE: [
    { keys: ['Ctrl', 'S'], description: 'Save map' },
    { keys: ['Ctrl', 'O'], description: 'Open saved map' },
    { keys: ['Ctrl', 'E'], description: 'Export as PNG' },
    { keys: ['Ctrl', 'Shift', 'E'], description: 'Export as SVG' },
  ],
  INTERFACE: [
    { keys: ['T'], description: 'Toggle theme' },
    { keys: ['?'], description: 'Show shortcuts' },
    { keys: ['Esc'], description: 'Close / clear selection' },
  ],
  INTERACTIONS: [
    { keys: ['Click Node'], description: 'Open menu & highlight edges' },
    { keys: ['Click Edge Label'], description: 'Highlight edge & show info' },
  ],
};

// Edge highlight color when a connected node is selected
export const EDGE_HIGHLIGHT_COLOR = '#6c5ce7';
