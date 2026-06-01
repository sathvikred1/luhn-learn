// Reactive provider for the runtime LLM config (API key + model + base URL).
// Persists to localStorage via configService so aiService reads consistent values.

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getApiConfig, setApiConfig, hasValidKey } from '../services/configService';

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => getApiConfig());

  const updateConfig = useCallback((partial) => {
    setApiConfig(partial);
    // Re-read so we apply the same env-fallback merge the service uses.
    setConfig(getApiConfig());
  }, []);

  const value = useMemo(
    () => ({
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
      hasKey: hasValidKey(config),
      updateConfig,
    }),
    [config, updateConfig]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
