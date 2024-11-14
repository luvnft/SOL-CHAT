import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfills
import { Buffer } from 'buffer';
import process from 'process';

// Global polyfills
window.Buffer = Buffer;
window.process = process;
window.global = window;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);