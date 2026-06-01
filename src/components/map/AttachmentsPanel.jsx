import { Image, Trash2, Wand2, Plus, Link as LinkIcon } from 'lucide-react';
import { SOURCE_TYPES } from '../../config/constants';

export default function AttachmentsPanel({
  isOpen,
  attachments,
  notes = [],
  nodes,
  selectedConcept,
  remainingAnalyses,
  onUpload,
  onUpdate,
  onRemove,
  onAnalyze,
  onAddSuggestions,
  onToggleNodeImage,
  onPreview,
  onAddImageNode,
  onAddNoteNode,
  onAttachNoteToConcept,
  onAttachImageToConcept,
  onShowMaterialNode,
}) {
  if (!isOpen) return null;

  return (
    <aside className="absolute bottom-0 left-0 z-30 flex max-h-[88vh] w-full flex-col border-t border-panel-border bg-panel-bg shadow-panel lg:bottom-auto lg:top-0 lg:h-full lg:w-[360px] lg:border-r lg:border-t-0">
      <div className="flex items-center justify-between border-b border-border-color p-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-text-primary">Attachments</h2>
          <p className="text-xs text-text-tertiary">{remainingAnalyses} image analyses left</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white">
          <Image size={16} />
          Upload
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => onUpload(Array.from(e.target.files || []))}
          />
        </label>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!!notes.length && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.05em] text-text-tertiary">Saved notes</p>
            {notes.map((note) => {
              const noteNode = nodes.find((node) => node.data.kind === 'note' && node.data.noteId === note.id);
              return (
                <div key={note.id} className="rounded-card border border-border-color bg-bg-primary p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-text-primary">
                    {note.title || note.text.split('\n')[0] || 'Saved note'}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{note.text}</p>
                  <button
                    onClick={() => (noteNode ? onShowMaterialNode(noteNode.id) : onAddNoteNode(note, selectedConcept?.id))}
                    className="mt-3 rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                  >
                    {noteNode ? 'Show on Map' : 'Add as Connected Node'}
                  </button>
                  <button
                    disabled={!selectedConcept}
                    onClick={() => selectedConcept && onAttachNoteToConcept(selectedConcept.id, note.id)}
                    className="ml-2 mt-3 rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary disabled:opacity-50"
                  >
                    Attach Under Selected Concept
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {attachments.length === 0 ? (
          <p className="rounded-card border border-dashed border-border-color p-4 text-sm text-text-tertiary">
            Upload class photos, screenshots, slides, textbook snippets, or personal images. Uploading never calls AI.
          </p>
        ) : (
          attachments.map((attachment) => (
            <div key={attachment.id} className="rounded-card border border-border-color bg-bg-primary p-3">
              {(() => {
                const imageNode = nodes.find((node) => node.data.kind === 'image' && node.data.imageId === attachment.id);
                return (
                  <>
                  <button
                    onClick={() => (imageNode ? onShowMaterialNode(imageNode.id) : onAddImageNode(attachment, selectedConcept?.id))}
                    className="mb-3 rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                  >
                    {imageNode ? 'Show on Map' : 'Add as Connected Node'}
                  </button>
                  <button
                    disabled={!selectedConcept}
                    onClick={() => selectedConcept && onAttachImageToConcept(selectedConcept.id, attachment.id)}
                    className="mb-3 ml-2 rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary disabled:opacity-50"
                  >
                    Attach Under Selected Concept
                  </button>
                  </>
                );
              })()}
              {attachment.localUrl && (
                <img
                  src={attachment.localUrl}
                  alt={attachment.fileName}
                  className="mb-3 h-32 w-full cursor-pointer rounded-md object-cover"
                  onClick={() => onPreview?.(attachment)}
                />
              )}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{attachment.fileName}</p>
                  <p className="text-xs text-text-tertiary">{Math.round(attachment.fileSize / 1024)} KB</p>
                </div>
                <button onClick={() => onRemove(attachment.id)} className="rounded-md p-1 text-text-tertiary hover:bg-bg-tertiary">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <select
                  value={attachment.sourceType}
                  onChange={(e) => onUpdate(attachment.id, { sourceType: e.target.value })}
                  className="w-full rounded-input border border-border-color bg-bg-primary px-2 py-1.5 text-xs text-text-primary"
                >
                  {SOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
                  ))}
                </select>
                <div className="max-h-28 space-y-1 overflow-y-auto rounded-input border border-border-color bg-bg-primary p-2">
                  {nodes.map((node) => {
                    const checked = (node.data.attachedImageIds || []).includes(attachment.id);
                    return (
                      <label key={node.id} className="flex items-center gap-2 text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleNodeImage(node.id, attachment.id)}
                        />
                        <span className="truncate">{node.data.label}</span>
                      </label>
                    );
                  })}
                </div>
                <textarea
                  value={attachment.userNote || ''}
                  onChange={(e) => onUpdate(attachment.id, { userNote: e.target.value })}
                  placeholder="Short note..."
                  className="h-16 w-full resize-none rounded-input border border-border-color bg-bg-primary px-2 py-1.5 text-xs text-text-primary"
                />
              </div>

              {attachment.extractedSummary && (
                <div className="mt-3 rounded-md bg-bg-secondary p-2 text-xs text-text-secondary">
                  {attachment.extractedSummary}
                </div>
              )}
              {!!attachment.keyConcepts?.length && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {attachment.keyConcepts.slice(0, 5).map((concept) => (
                    <span key={concept} className="rounded-full bg-bg-secondary px-2 py-0.5 text-[11px] text-text-tertiary">
                      {concept}
                    </span>
                  ))}
                </div>
              )}
              {!!attachment.suggestedNodes?.length && (
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-text-tertiary">
                    Suggested nodes
                  </p>
                  {attachment.suggestedNodes.map((node) => (
                    <div key={node.title} className="flex items-center justify-between gap-2 rounded-md bg-bg-secondary px-2 py-1">
                      <span className="truncate text-xs text-text-secondary">{node.title}</span>
                      <button
                        onClick={() =>
                          onAddSuggestions({
                            ...attachment,
                            suggestedNodes: [node],
                            suggestedEdges: [],
                          })
                        }
                        className="text-xs font-semibold text-brand-primary"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => onAnalyze(attachment)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                >
                  <Wand2 size={14} />
                  Analyze Image
                </button>
                {!!attachment.suggestedNodes?.length && (
                  <button
                    onClick={() => onAddSuggestions(attachment)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border-color px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-bg-tertiary"
                  >
                    <Plus size={14} />
                    Add suggestions
                  </button>
                )}
                {nodes.some((node) => (node.data.attachedImageIds || []).includes(attachment.id)) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary px-2 py-1 text-xs text-text-tertiary">
                    <LinkIcon size={12} />
                    Linked
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
