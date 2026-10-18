import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const boundFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : undefined;
  if (boundFetch) {
    if (typeof Window !== 'undefined' && Window.prototype) {
      Object.defineProperty(Window.prototype, 'fetch', {
        value: boundFetch,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    Object.defineProperty(window, 'fetch', {
      value: boundFetch,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Ignore if already configured
}

createRoot(document.getElementById('root')!).render(<App />);
