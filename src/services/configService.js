// Runtime LLM config: user-supplied API key + model (localStorage), falling
// back to .env defaults. Read at call-time so changes apply without a restart.

import {
  STORAGE_KEYS,
  DEFAULT_MODEL,
  DEFAULT_BASE_URL,
  API_KEY_PLACEHOLDER,
} from '../config/constants';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Merge stored values over .env defaults. A blank/missing stored value falls
// back to env so deleting the field in the UI reverts to the .env key.
export function getApiConfig() {
  const stored = readStored();
  return {
    apiKey: stored.apiKey || import.meta.env.VITE_LLM_API_KEY || '',
    model: stored.model || import.meta.env.VITE_LLM_MODEL || DEFAULT_MODEL,
    baseUrl: stored.baseUrl || import.meta.env.VITE_LLM_BASE_URL || DEFAULT_BASE_URL,
  };
}

export function setApiConfig(partial) {
  const next = { ...readStored(), ...partial };
  try {
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
  return next;
}

// True when the resolved key is usable (present and not the placeholder).
export function hasValidKey(cfg = getApiConfig()) {
  return Boolean(cfg.apiKey) && cfg.apiKey !== API_KEY_PLACEHOLDER;
}
