// Floating toolbar: topic input + Generate (row 1), action buttons (row 2).

import { useState } from 'react';
import {
  Home,
  Save,
  FolderOpen,
  RefreshCw,
  Columns,
  Rows,
  Download,
  Keyboard,
  Palette,
  CircleHelp,
  Layers,
  Image,
  StickyNote,
  PlusCircle,
} from 'lucide-react';
import ExportDropdown from '../modals/ExportDropdown';
import {
  DIFFICULTY_LEVELS,
  DEFAULT_MAP_SETTINGS,
  LEARNING_GOALS,
  LAYOUT_DIRECTION,
  TIME_AVAILABLE_OPTIONS,
} from '../../config/constants';

function ToolButton({ icon: Icon, label, onClick, indicator }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-toolbar-button-hover"
    >
      <Icon size={18} className="text-text-secondary" />
      <span className="text-[12px] text-text-tertiary">{label}</span>
      {indicator && (
        <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-orange-400" />
      )}
    </button>
  );
}

export default function MapToolbar({
  topic,
  settings,
  onTopicChange,
  onSettingsChange,
  onGenerate,
  onStartQuiz,
  onStartFlashcards,
  onToggleAttachments,
  onAddNote,
  onAddNode,
  onHome,
  onSave,
  onOpen,
  onRealign,
  onToggleLayout,
  onExport,
  onShowShortcuts,
  onToggleTheme,
  layoutDirection,
  hasUnsavedChanges,
  isGenerating,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const activeSettings = settings || DEFAULT_MAP_SETTINGS;

  // Button shows the direction you'll switch TO.
  const isVertical = layoutDirection === LAYOUT_DIRECTION.VERTICAL;
  const layoutLabel = isVertical ? 'Horizontal' : 'Vertical';
  const LayoutIcon = isVertical ? Columns : Rows;

  return (
    <div className="absolute left-1/2 top-4 z-30 w-full max-w-[860px] -translate-x-1/2 px-4">
      <div className="rounded-card border border-toolbar-border bg-toolbar-bg shadow-modal">
        {/* Row 1 */}
        <div className="flex items-center gap-2 p-3">
          <button
            onClick={onHome}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-toolbar-button-hover"
            aria-label="Home"
          >
            <Home size={18} />
          </button>
          <input
            type="text"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
            placeholder="Enter a topic…"
            className="flex-1 rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary"
          />
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-hover disabled:opacity-60"
          >
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 px-3 pb-3 sm:grid-cols-3">
          <select
            value={activeSettings.difficulty}
            onChange={(e) => onSettingsChange({ difficulty: e.target.value })}
            className="rounded-input border border-border-color bg-bg-primary px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary"
          >
            {DIFFICULTY_LEVELS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select
            value={activeSettings.learningGoal}
            onChange={(e) => onSettingsChange({ learningGoal: e.target.value })}
            className="rounded-input border border-border-color bg-bg-primary px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary"
          >
            {LEARNING_GOALS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select
            value={activeSettings.timeAvailable}
            onChange={(e) => onSettingsChange({ timeAvailable: e.target.value })}
            className="rounded-input border border-border-color bg-bg-primary px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary"
          >
            {TIME_AVAILABLE_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-toolbar-border" />

        {/* Row 2 */}
        <div className="flex flex-wrap items-center justify-center gap-1 p-2">
          <ToolButton icon={Save} label="Save" onClick={onSave} indicator={hasUnsavedChanges} />
          <ToolButton icon={FolderOpen} label="Open" onClick={onOpen} />
          <ToolButton icon={Image} label="Images" onClick={onToggleAttachments} />
          <ToolButton icon={StickyNote} label="Add Note" onClick={onAddNote} />
          <ToolButton icon={PlusCircle} label="Add Node" onClick={onAddNode} />
          <ToolButton icon={CircleHelp} label="Quiz" onClick={onStartQuiz} />
          <ToolButton icon={Layers} label="Cards" onClick={onStartFlashcards} />
          <ToolButton icon={RefreshCw} label="Re-align" onClick={onRealign} />
          <ToolButton icon={LayoutIcon} label={layoutLabel} onClick={onToggleLayout} />
          <div className="relative">
            <ToolButton
              icon={Download}
              label="Export"
              onClick={() => setExportOpen((v) => !v)}
            />
            <ExportDropdown
              isOpen={exportOpen}
              onClose={() => setExportOpen(false)}
              onSelect={onExport}
            />
          </div>
          <ToolButton icon={Keyboard} label="Shortcuts" onClick={onShowShortcuts} />
          <ToolButton icon={Palette} label="Theme" onClick={onToggleTheme} />
        </div>
      </div>
    </div>
  );
}
