import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { ConfigProvider } from './context/ConfigContext';
import { MapProvider } from './context/MapContext';
import { AppToaster } from './components/ui/Toast';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ConfigProvider>
          <MapProvider>
            <App />
            <AppToaster />
          </MapProvider>
        </ConfigProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
