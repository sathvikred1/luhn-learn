// "My Saved Maps" dialog: list of saved maps with open + delete.

import { Inbox, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { formatDate } from '../../utils/formatUtils';

export default function OpenMapModal({ isOpen, onClose, maps, onOpen, onDelete }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Saved Maps" width={520}>
      {maps.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Inbox size={40} className="text-text-tertiary" />
          <p className="font-medium text-text-primary">No saved maps yet</p>
          <p className="text-sm text-text-tertiary">
            Create a concept map and save it to see it here.
          </p>
        </div>
      ) : (
        <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {maps.map((map) => (
            <li
              key={map.id}
              className="group flex items-center justify-between rounded-card border border-border-color px-4 py-3 transition-colors hover:border-brand-primary hover:bg-bg-secondary"
            >
              <button
                onClick={() => onOpen(map)}
                className="flex-1 text-left"
              >
                <span className="block font-medium text-text-primary">
                  {map.title}
                </span>
                <span className="block text-xs text-text-tertiary">
                  {formatDate(map.updatedAt || map.createdAt)}
                </span>
              </button>
              <button
                onClick={() => onDelete(map.id)}
                className="rounded-md p-2 text-text-tertiary opacity-0 transition-all hover:bg-bg-tertiary hover:text-brand-accent group-hover:opacity-100"
                aria-label="Delete map"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
