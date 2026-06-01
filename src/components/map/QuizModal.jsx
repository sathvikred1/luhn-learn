import { useMemo, useState } from 'react';
import Modal from '../ui/Modal';

export default function QuizModal({ isOpen, onClose, nodes, onAnswer }) {
  const questions = useMemo(
    () =>
      nodes.flatMap((node) =>
        (node.data.quiz || []).map((question) => ({
          ...question,
          nodeId: node.id,
          nodeLabel: node.data.label,
        }))
      ),
    [nodes]
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const current = questions[index];
  const isCorrect = selected && selected === current?.answer;

  function submit() {
    if (!selected || answered) return;
    setAnswered(true);
    if (isCorrect) setScore((value) => value + 1);
    onAnswer(current.nodeId, isCorrect);
  }

  function next() {
    setSelected('');
    setAnswered(false);
    setIndex((value) => Math.min(value + 1, questions.length - 1));
  }

  function close() {
    setIndex(0);
    setSelected('');
    setAnswered(false);
    setScore(0);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title="Quiz Mode" width={560}>
      {!current ? (
        <p className="text-sm text-text-secondary">No quiz questions are available yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-text-tertiary">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>Score {score}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-brand-primary">
              {current.nodeLabel}
            </p>
            <p className="mt-1 font-medium text-text-primary">{current.question}</p>
          </div>
          <div className="space-y-2">
            {current.options.map((option) => (
              <button
                key={option}
                onClick={() => !answered && setSelected(option)}
                className={`w-full rounded-card border px-3 py-2 text-left text-sm transition-colors ${
                  selected === option
                    ? 'border-brand-primary bg-bg-tertiary text-text-primary'
                    : 'border-border-color bg-bg-primary text-text-secondary hover:bg-bg-secondary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {answered && (
            <div className={`rounded-card p-3 text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              <p className="font-semibold">{isCorrect ? 'Correct' : 'Needs revision'}</p>
              <p>{current.explanation}</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            {!answered ? (
              <button onClick={submit} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
                Check
              </button>
            ) : index < questions.length - 1 ? (
              <button onClick={next} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
                Next
              </button>
            ) : (
              <button onClick={close} className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
                Finish
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
