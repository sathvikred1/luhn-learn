// localStorage CRUD for saved concept maps.

import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../config/constants';

export function loadMaps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_MAPS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(maps) {
  localStorage.setItem(STORAGE_KEYS.SAVED_MAPS, JSON.stringify(maps));
}

// Saves a new map or updates an existing one (matched by id).
export function saveMap({
  id,
  title,
  topic,
  nodes,
  edges,
  layoutDirection,
  settings,
  attachments = [],
  notes = [],
}) {
  const maps = loadMaps();
  const now = new Date().toISOString();

  if (id) {
    const idx = maps.findIndex((m) => m.id === id);
    if (idx !== -1) {
      maps[idx] = {
        ...maps[idx],
        title,
        topic,
        nodes,
        edges,
        layoutDirection,
        settings,
        attachments,
        notes,
        updatedAt: now,
      };
      persist(maps);
      return maps[idx];
    }
  }

  const newMap = {
    id: uuidv4(),
    title,
    topic,
    nodes,
    edges,
    layoutDirection,
    settings,
    attachments,
    notes,
    createdAt: now,
    updatedAt: now,
  };
  maps.unshift(newMap);
  persist(maps);
  return newMap;
}

export function deleteMap(id) {
  const maps = loadMaps().filter((m) => m.id !== id);
  persist(maps);
  return maps;
}

export function getMap(id) {
  return loadMaps().find((m) => m.id === id) || null;
}

export function saveCurrentMapDraft(map) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_MAP, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function loadCurrentMapDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_MAP);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
