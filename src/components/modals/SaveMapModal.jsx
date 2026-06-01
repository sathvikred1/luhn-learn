// Save dialog with a title input, pre-filled with the current topic.

import { useState } from 'react';
import { Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function SaveMapModal({ isOpen, onClose, defaultTitle, onSave }) {
  const [title, setTitle] = useState(defaultTitle || '');
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Reset the title to the current topic each time the modal opens
  // (adjust-state-during-render, the React-recommended alternative to an effect).
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setTitle(defaultTitle || '');
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Map" width={480}>
      <label className="mb-2 block text-sm font-medium text-text-secondary">
        Map Title
      </label>
      <input
        type="text"
        value={title}
        autoFocus
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="mb-6 w-full rounded-input border border-border-color bg-bg-primary px-4 py-2.5 text-text-primary outline-none focus:border-brand-primary"
      />
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="blue" onClick={handleSave}>
          <Save size={16} /> Save
        </Button>
      </div>
    </Modal>
  );
}
