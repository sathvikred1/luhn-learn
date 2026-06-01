// Persistent top bar on the map page: bring-your-own Gemini API key + model.
// Values are applied immediately (via ConfigContext) so the next AI call uses them.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import Tooltip from '../ui/Tooltip';
import logo from '../../assets/logo.svg';
import { APP_NAME, GEMINI_MODELS } from '../../config/constants';

const CUSTOM = '__custom__';

export default function MapNavbar() {
  const { apiKey, model, hasKey, updateConfig } = useConfig();
  const [showKey, setShowKey] = useState(false);

  // The dropdown shows "Custom…" whenever the active model isn't a preset.
  const isPreset = GEMINI_MODELS.includes(model);
  const [customMode, setCustomMode] = useState(!isPreset && Boolean(model));

  const onModelSelect = (value) => {
    if (value === CUSTOM) {
      setCustomMode(true);
      return;
    }
    setCustomMode(false);
    updateConfig({ model: value });
  };

  return (
    <header className="z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border-color bg-bg-primary px-4">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2">
        <img src={logo} alt="" className="h-6 w-6" />
        <span className="font-brand text-lg font-bold text-text-primary">
          {APP_NAME}
        </span>
      </Link>

      {/* API config */}
      <div className="flex items-center gap-3">
        {/* Key status dot */}
        <Tooltip
          label={hasKey ? 'Gemini key set' : 'No Gemini API key — generation will fail'}
          position="bottom"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              hasKey ? 'bg-brand-secondary' : 'bg-brand-accent'
            }`}
          />
        </Tooltip>

        {/* API key field */}
        <div
          className={`flex items-center rounded-input border bg-bg-primary px-2 ${
            hasKey ? 'border-border-color' : 'border-brand-accent'
          } focus-within:border-brand-primary`}
        >
          <KeyRound size={15} className="text-text-tertiary" />
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => updateConfig({ apiKey: e.target.value })}
            placeholder="Gemini API key"
            autoComplete="off"
            spellCheck={false}
            className="w-40 bg-transparent px-2 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary sm:w-52"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="rounded p-1 text-text-tertiary transition-colors hover:text-text-primary"
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Model selector */}
        <div className="flex items-center gap-2">
          <select
            value={customMode ? CUSTOM : model}
            onChange={(e) => onModelSelect(e.target.value)}
            className="rounded-input border border-border-color bg-bg-primary px-2 py-1.5 text-sm text-text-primary outline-none focus:border-brand-primary"
          >
            {GEMINI_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value={CUSTOM}>Custom…</option>
          </select>

          {customMode && (
            <input
              type="text"
              value={isPreset ? '' : model}
              onChange={(e) => updateConfig({ model: e.target.value })}
              placeholder="model id"
              spellCheck={false}
              className="w-32 rounded-input border border-border-color bg-bg-primary px-2 py-1.5 text-sm text-text-primary outline-none focus:border-brand-primary"
            />
          )}
        </div>
      </div>
    </header>
  );
}
