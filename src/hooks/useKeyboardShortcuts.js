// Global keyboard shortcut bindings for the map page.
// Accepts a map of handlers; ignores key events while typing in inputs.

import { useEffect } from 'react';

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const onKeyDown = (e) => {
      const mod = e.metaKey || e.ctrlKey;

      // Modifier combos work even when not focused on the canvas,
      // but we still skip when typing to avoid hijacking text editing
      // (except for the save/open/export combos which we always intercept).
      if (mod) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          handlers.onSave?.();
          return;
        }
        if (key === 'o') {
          e.preventDefault();
          handlers.onOpen?.();
          return;
        }
        if (key === 'e') {
          e.preventDefault();
          if (e.shiftKey) handlers.onExportSvg?.();
          else handlers.onExportPng?.();
          return;
        }
        return;
      }

      if (isTypingTarget(e.target)) {
        if (e.key === 'Escape') handlers.onEscape?.();
        return;
      }

      switch (e.key) {
        case 'f':
        case 'F':
          handlers.onFit?.();
          break;
        case 'r':
        case 'R':
          handlers.onRealign?.();
          break;
        case 'l':
        case 'L':
          handlers.onToggleLayout?.();
          break;
        case '+':
        case '=':
          handlers.onZoomIn?.();
          break;
        case '-':
        case '_':
          handlers.onZoomOut?.();
          break;
        case 't':
        case 'T':
          handlers.onToggleTheme?.();
          break;
        case '?':
          handlers.onShowShortcuts?.();
          break;
        case 'Escape':
          handlers.onEscape?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}
