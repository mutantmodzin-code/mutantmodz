import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent copy, cut, and right-click events globally
if (typeof window !== 'undefined') {
  window.addEventListener('copy', (e) => e.preventDefault());
  window.addEventListener('cut', (e) => e.preventDefault());
  window.addEventListener('contextmenu', (e) => e.preventDefault());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
