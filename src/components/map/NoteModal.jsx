import { useState } from 'react';
import Modal from '../ui/Modal';
import { NOTE_SOURCE_TYPES } from '../../config/constants';

export default function NoteModal({
  isOpen,
  nodes,
  initial = {},
  remainingGenerations,
  onClose,
  onSave,
  onGenerate,
}) {
  const [text, setText] = useState(initial.text || '');
  const [linkedNodeId, setLinkedNodeId] = useState(initial.linkedNodeId || '');
  const [sourceType, setSourceType] = useState(initial.sourceType || 'personal_note');

  const draft = { text, linkedNodeId: linkedNodeId || undefined, sourceType };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Note" width={560}>
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste class notes, website notes, YouTube transcript snippets, or your own explanation..."
          className="h-36 w-full resize-none rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={sourceType} onChange={(e) => setSourceType(e.target.value)} className="rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary">
            {NOTE_SOURCE_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
          </select>
          <select value={linkedNodeId} onChange={(e) => setLinkedNodeId(e.target.value)} className="rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary">
            <option value="">Global map note</option>
            {nodes.map((node) => <option key={node.id} value={node.id}>{node.data.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-text-tertiary">
          Typing notes does not call AI. {remainingGenerations} note generations left.
        </p>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-border-color px-4 py-2 text-sm font-semibold text-text-secondary">Cancel</button>
        <button onClick={() => onGenerate(draft)} className="rounded-lg border border-border-color px-4 py-2 text-sm font-semibold text-text-secondary">Generate Nodes from Note</button>
        <button onClick={() => onSave(draft)} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white">Save Note</button>
      </div>
    </Modal>
  );
}
