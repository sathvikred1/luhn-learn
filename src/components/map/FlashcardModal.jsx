import { useMemo, useState } from 'react';
import Modal from '../ui/Modal';

export default function FlashcardModal({ isOpen, onClose, nodes, onGrade }) {
  const cards = useMemo(
    () =>
      nodes.flatMap((node) =>
        (node.data.flashcards || []).map((card) => ({
          ...card,
          nodeId: node.id,
          nodeLabel: node.data.label,
        }))
      ),
    [nodes]
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const current = cards[index];

  function grade(value) {
    if (!current) return;
    onGrade(current.nodeId, value);
    setFlipped(false);
    setIndex((nextIndex) => Math.min(nextIndex + 1, cards.length - 1));
  }

  function close() {
    setIndex(0);
    setFlipped(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title="Flashcards" width={560}>
      {!current ? (
        <p className="text-sm text-text-secondary">No flashcards are available yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-text-tertiary">
            <span>
              Card {index + 1} of {cards.length}
            </span>
            <span>{current.nodeLabel}</span>
          </div>
          <button
            onClick={() => setFlipped((value) => !value)}
            className="flex min-h-44 w-full items-center justify-center rounded-card border border-border-color bg-bg-secondary p-6 text-center"
          >
            <p className="text-lg font-semibold text-text-primary">
              {flipped ? current.back : current.front}
            </p>
          </button>
          <div className="flex justify-between gap-2">
            <button onClick={() => grade('again')} className="flex-1 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              Again
            </button>
            <button onClick={() => grade('good')} className="flex-1 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
              Good
            </button>
            <button onClick={() => grade('easy')} className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              Easy
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
