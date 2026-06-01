import { X } from 'lucide-react';
import { LEARNING_STATUSES, NOTE_SOURCE_TYPES } from '../../config/constants';
import { buildBreadcrumb } from '../../utils/formatUtils';
import { statusLabel } from '../../utils/learningUtils';

function Section({ title, children }) {
  return (
    <section className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.05em] text-text-tertiary">
        {title}
      </p>
      <div className="text-sm leading-relaxed text-text-secondary">{children}</div>
    </section>
  );
}

export default function DetailPanel({
  detail,
  notes = [],
  attachments = [],
  onClose,
  onStatusChange,
  onAddNote,
  onUploadImage,
  onUpdateNode,
  onDeleteNode,
  onToggleNodeImage,
  onToggleNodeNote,
  onAnalyzeImage,
  onPreviewImage,
  onAddNoteNode,
  onAddImageNode,
}) {
  if (!detail) return null;

  const flashcard = detail.flashcards?.[0];
  const quiz = detail.quiz?.[0];
  const linkedNotes = notes.filter(
    (note) => (detail.attachedNoteIds || []).includes(note.id) || note.linkedNodeId === detail.id
  );
  const linkedAttachments = attachments.filter((attachment) =>
    (detail.attachedImageIds || []).includes(attachment.id)
  );

  return (
    <aside
      className="absolute bottom-0 right-0 top-auto z-30 flex max-h-[88vh] w-full flex-col border-t border-panel-border bg-panel-bg shadow-panel sm:top-0 sm:h-full sm:max-h-none sm:w-[420px] sm:border-l sm:border-t-0"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between border-b border-border-color p-5">
        <div className="pr-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">
            {detail.label}
          </h2>
          <p className="mt-1 text-sm font-medium text-brand-primary">
            {buildBreadcrumb(detail.parentLabel, detail.label)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.05em] text-text-tertiary">
            Learning status
          </label>
          <select
            value={detail.learningStatus}
            onChange={(e) => onStatusChange(detail.id, e.target.value)}
            className="w-full rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-primary"
          >
            {Object.values(LEARNING_STATUSES).map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <Section title="Manual editing">
          <div className="space-y-2">
            <input
              value={detail.label}
              onChange={(e) => onUpdateNode?.(detail.id, { label: e.target.value, title: e.target.value })}
              className="w-full rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary"
            />
            <textarea
              value={detail.summary || ''}
              onChange={(e) => onUpdateNode?.(detail.id, { summary: e.target.value })}
              className="h-20 w-full resize-none rounded-input border border-border-color bg-bg-primary px-3 py-2 text-sm text-text-primary"
            />
            {detail.isUserCreated && (
              <button
                onClick={() => onDeleteNode?.(detail.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Delete custom node
              </button>
            )}
          </div>
        </Section>

        <Section title="Summary">{detail.summary || 'No summary available.'}</Section>
        <Section title="Analogy">{detail.analogy || 'No analogy available.'}</Section>
        <Section title="Example">{detail.example || 'No example available.'}</Section>
        <Section title="Why it matters">
          {detail.whyItMatters || 'This concept helps connect the rest of the topic.'}
        </Section>
        <Section title="Common mistake">
          {detail.commonMistake || 'No common mistake available.'}
        </Section>
        <Section title="Attached Notes">
          <div className="space-y-2">
            {linkedNotes.length ? (
              linkedNotes.map((note) => (
                <div key={note.id} className="rounded-card border border-border-color bg-bg-secondary p-3">
                  <p>{note.text}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{note.sourceType.replaceAll('_', ' ')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => onAddNoteNode?.(note, detail.id)}
                      className="rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                    >
                      Add as connected node
                    </button>
                    <button
                      onClick={() => onToggleNodeNote?.(detail.id, note.id)}
                      className="rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                    >
                      Detach
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No notes attached.</p>
            )}
            <button
              onClick={() => onAddNote?.({ linkedNodeId: detail.id, sourceType: NOTE_SOURCE_TYPES[0] })}
              className="rounded-lg border border-border-color px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
            >
              Add Note
            </button>
          </div>
        </Section>
        <Section title="Attached images">
          <div className="space-y-2">
            {linkedAttachments.length ? (
              linkedAttachments.map((attachment) => (
                <div key={attachment.id} className="rounded-card border border-border-color bg-bg-secondary p-2">
                  {attachment.localUrl && (
                    <img
                      src={attachment.localUrl}
                      alt={attachment.fileName}
                      className="mb-2 h-28 w-full cursor-pointer rounded-md object-cover"
                      onClick={() => onPreviewImage?.(attachment)}
                    />
                  )}
                  <p className="truncate text-xs font-semibold text-text-primary">{attachment.fileName}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => onAnalyzeImage?.(attachment)}
                      className="rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                    >
                      Analyze Image
                    </button>
                    <button
                      onClick={() => onAddImageNode?.(attachment, detail.id)}
                      className="rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                    >
                      Add as connected node
                    </button>
                    <button
                      onClick={() => onToggleNodeImage?.(detail.id, attachment.id)}
                      className="rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                    >
                      Unlink
                    </button>
                  </div>
                  {attachment.extractedText && (
                    <p className="mt-2 max-h-24 overflow-y-auto text-xs">{attachment.extractedText}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No images attached.</p>
            )}
            <label className="inline-flex cursor-pointer rounded-lg border border-border-color px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary">
              Upload Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => onUploadImage?.(Array.from(e.target.files || []), detail.id)}
              />
            </label>
          </div>
        </Section>
        <Section title="Prerequisites">
          {detail.prerequisiteLabels?.length ? detail.prerequisiteLabels.join(', ') : 'None'}
        </Section>

        {flashcard && (
          <Section title="Flashcard">
            <div className="rounded-card border border-border-color bg-bg-secondary p-3">
              <p className="font-medium text-text-primary">{flashcard.front}</p>
              <p className="mt-2">{flashcard.back}</p>
            </div>
          </Section>
        )}

        {quiz && (
          <Section title="Mini quiz">
            <div className="rounded-card border border-border-color bg-bg-secondary p-3">
              <p className="font-medium text-text-primary">{quiz.question}</p>
              <p className="mt-2 text-xs text-text-tertiary">
                Answer: {quiz.answer}
              </p>
            </div>
          </Section>
        )}
      </div>
    </aside>
  );
}
