import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent right-click, copy, and cut events globally
if (typeof window !== 'undefined') {
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('copy', (e) => e.preventDefault());
  window.addEventListener('cut', (e) => e.preventDefault());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
