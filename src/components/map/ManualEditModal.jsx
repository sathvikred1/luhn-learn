import { useState } from 'react';
import Modal from '../ui/Modal';

export default function ManualEditModal({ isOpen, mode, nodes, onClose, onAddNode, onConnect }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [label, setLabel] = useState('');

  function reset() {
    setTitle('');
    setSummary('');
    setSource('');
    setTarget('');
    setLabel('');
  }

  function close() {
    reset();
    onClose();
  }

  function submit() {
    if (mode === 'node') onAddNode({ title, summary });
    else onConnect({ source, target, label });
    close();
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title={mode === 'node' ? 'Add Custom Node' : 'Connect Nodes'} width={520}>
      {mode === 'node' ? (
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Node title"
            className="w-full rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary"
          />
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Optional summary"
            className="h-24 w-full resize-none rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary">
            <option value="">Source node</option>
            {nodes.map((node) => <option key={node.id} value={node.id}>{node.data.label}</option>)}
          </select>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary">
            <option value="">Target node</option>
            {nodes.map((node) => <option key={node.id} value={node.id}>{node.data.label}</option>)}
          </select>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Relationship label"
            className="w-full rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary"
          />
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={close} className="rounded-lg border border-border-color px-4 py-2 text-sm font-semibold text-text-secondary">Cancel</button>
        <button onClick={submit} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white">Save</button>
      </div>
    </Modal>
  );
}
