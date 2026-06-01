// Bottom-right vertical zoom/fit/fullscreen control group.

import { Plus, Minus, Maximize, Expand } from 'lucide-react';

function ControlButton({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center bg-bg-primary text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
    >
      {children}
    </button>
  );
}

export default function ZoomControls({ onZoomIn, onZoomOut, onFit, onFullscreen }) {
  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col overflow-hidden rounded-card border border-border-color shadow-card divide-y divide-border-color">
      <ControlButton onClick={onZoomIn} label="Zoom in">
        <Plus size={18} />
      </ControlButton>
      <ControlButton onClick={onZoomOut} label="Zoom out">
        <Minus size={18} />
      </ControlButton>
      <ControlButton onClick={onFit} label="Fit view">
        <Maximize size={18} />
      </ControlButton>
      <ControlButton onClick={onFullscreen} label="Fullscreen">
        <Expand size={18} />
      </ControlButton>
    </div>
  );
}
