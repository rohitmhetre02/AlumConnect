import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Suppress React DevTools security errors and React work cycle errors
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args[0]?.toString() || '';
  
  // Suppress React DevTools security errors
  if (message.includes('Failed to read a named property \'$$typeof\' from \'Window\'')) {
    return;
  }
  
  // Suppress React work cycle errors
  if (message.includes('Should not already be working')) {
    return;
  }
  
  // Suppress other React DevTools related errors
  if (message.includes('Blocked a frame with origin') && message.includes('cross-origin frame')) {
    return;
  }
  
  originalError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  
  // Suppress React DevTools warnings
  if (message.includes('Failed to read a named property \'$$typeof\' from \'Window\'')) {
    return;
  }
  
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
)