import { useState } from 'react';
import Modal from '../ui/Modal';

export default function ImagePreviewModal({
  image,
  nodes,
  onClose,
  onAnalyze,
  onToggleNodeImage,
  onAddSuggestions,
  onAttachSummary,
}) {
  const [summaryNodeId, setSummaryNodeId] = useState('');

  return (
    <Modal isOpen={!!image} onClose={onClose} title={image?.fileName || 'Image'} width={760}>
      {image && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            {image.localUrl && (
              <img src={image.localUrl} alt={image.fileName} className="max-h-[60vh] w-full rounded-card object-contain bg-bg-secondary" />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onAnalyze(image)} className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white">
                Analyze Image
              </button>
              {!!image.suggestedNodes?.length && (
                <button onClick={() => onAddSuggestions(image)} className="rounded-lg border border-border-color px-3 py-2 text-sm font-semibold text-text-secondary">
                  Add Suggested Nodes
                </button>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.05em] text-text-tertiary">Attach to nodes</p>
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-card border border-border-color p-2">
                {nodes.map((node) => (
                  <label key={node.id} className="flex items-center gap-2 text-sm text-text-secondary">
                    <input
                      type="checkbox"
                      checked={(node.data.attachedImageIds || []).includes(image.id)}
                      onChange={() => onToggleNodeImage(node.id, image.id)}
                    />
                    <span className="truncate">{node.data.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {image.extractedSummary && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.05em] text-text-tertiary">Summary</p>
                <p className="text-sm text-text-secondary">{image.extractedSummary}</p>
                <div className="mt-3 flex gap-2">
                  <select
                    value={summaryNodeId}
                    onChange={(e) => setSummaryNodeId(e.target.value)}
                    className="min-w-0 flex-1 rounded-input border border-border-color bg-bg-primary px-2 py-1.5 text-xs text-text-primary"
                  >
                    <option value="">Attach summary to node</option>
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>{node.data.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => summaryNodeId && onAttachSummary?.(summaryNodeId, image)}
                    className="rounded-lg border border-border-color px-3 py-1.5 text-xs font-semibold text-text-secondary"
                  >
                    Attach
                  </button>
                </div>
              </div>
            )}
            {image.extractedText && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.05em] text-text-tertiary">Extracted text</p>
                <p className="max-h-40 overflow-y-auto rounded-card bg-bg-secondary p-2 text-xs text-text-secondary">{image.extractedText}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
