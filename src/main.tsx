// Ensure window.fetch is writable to prevent "Cannot set property fetch of #<Window> which has only a getter"
try {
  if (typeof window !== 'undefined' && window.fetch) {
    const _nativeFetch = window.fetch.bind(window);
    let _currentFetch = _nativeFetch;
    Object.defineProperty(window, 'fetch', {
      get() {
        return _currentFetch;
      },
      set(fn) {
        _currentFetch = fn;
      },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Ignore fallback
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
