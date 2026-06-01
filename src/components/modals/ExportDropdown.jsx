// Export format dropdown (PNG / SVG / JSON), anchored under the toolbar button.

import { useEffect, useRef } from 'react';
import { Image, PenTool, FileJson } from 'lucide-react';

const ITEMS = [
  { key: 'png', icon: Image, label: 'PNG Image' },
  { key: 'svg', icon: PenTool, label: 'SVG Vector' },
  { key: 'json', icon: FileJson, label: 'JSON Data' },
];

export default function ExportDropdown({ isOpen, onClose, onSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-40 mt-2 w-44 animate-scale-in overflow-hidden rounded-card border border-border-color bg-bg-primary py-1 shadow-modal"
    >
      {ITEMS.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => {
            onSelect(key);
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
  );
}
