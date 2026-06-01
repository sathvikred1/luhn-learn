// Export logic: PNG / SVG (via html-to-image) and JSON download.

import { toPng, toSvg } from 'html-to-image';
import { toFilenameSlug } from '../utils/formatUtils';

// Trigger a browser download for a data URL or blob URL.
function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Finds the React Flow viewport element to capture.
function getViewportElement() {
  const el = document.querySelector('.react-flow__viewport');
  if (!el) throw new Error('Canvas not found.');
  return el;
}

// Resolve a background color from the current theme for raster exports.
function getBackgroundColor() {
  const styles = getComputedStyle(document.body);
  return styles.getPropertyValue('--bg-secondary').trim() || '#ffffff';
}

export async function exportPng(topic) {
  const el = getViewportElement();
  const dataUrl = await toPng(el, {
    backgroundColor: getBackgroundColor(),
    pixelRatio: 2,
    cacheBust: true,
  });
  downloadDataUrl(dataUrl, `${toFilenameSlug(topic)}-concept-map.png`);
}

export async function exportSvg(topic) {
  const el = getViewportElement();
  const dataUrl = await toSvg(el, {
    backgroundColor: getBackgroundColor(),
    cacheBust: true,
  });
  downloadDataUrl(dataUrl, `${toFilenameSlug(topic)}-concept-map.svg`);
}

export function exportJson(topic, nodes, edges, layoutDirection) {
  const payload = {
    topic,
    layoutDirection,
    nodes,
    edges,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, `${toFilenameSlug(topic)}-concept-map.json`);
  URL.revokeObjectURL(url);
}
