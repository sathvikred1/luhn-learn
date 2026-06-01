// Text formatting helpers: truncation, breadcrumbs, filenames, dates.

export function truncate(text, max = 40) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Build a "Parent > Current" style breadcrumb from node labels.
export function buildBreadcrumb(parentLabel, currentLabel) {
  if (!parentLabel) return currentLabel || '';
  return `${parentLabel} › ${currentLabel}`;
}

// Slug for export filenames: "Quantum Physics" -> "quantum-physics"
export function toFilenameSlug(text) {
  if (!text) return 'concept-map';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'concept-map';
}

// Human-friendly date for saved-map list, e.g. "May 27, 2026"
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
