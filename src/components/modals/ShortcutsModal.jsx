// Keyboard shortcuts reference, grouped into labeled sections.

import Modal from '../ui/Modal';
import { SHORTCUTS } from '../../config/constants';

function KeyBadge({ children }) {
  return (
    <kbd className="rounded-md bg-bg-tertiary px-2.5 py-1 font-mono text-xs text-text-primary">
      {children}
    </kbd>
  );
}

function ShortcutRow({ keys, description }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-text-secondary">{description}</span>
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-xs text-text-tertiary">+</span>}
            <KeyBadge>{k}</KeyBadge>
          </span>
        ))}
      </span>
    </div>
  );
}

export default function ShortcutsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" width={560}>
      <div className="grid gap-6 sm:grid-cols-2">
        {Object.entries(SHORTCUTS).map(([section, rows]) => (
          <div key={section}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              {section}
            </h4>
            <div className="divide-y divide-border-color">
              {rows.map((row, i) => (
                <ShortcutRow key={i} keys={row.keys} description={row.description} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
