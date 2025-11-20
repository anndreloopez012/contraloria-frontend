import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import installSafeConsoleFilter from './utils/safeConsole'
import { getDisableRightClick } from './config/apiEnv'

// Install global console sanitizer to prevent leaking URLs/paths in logs
installSafeConsoleFilter()

// Suppress Facebook SDK errors globally
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('Could not find element') ||
    event.message.includes('fburl.com') ||
    event.message.includes('ErrorUtils')
  )) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Disable right-click and context menu based on configuration
if (getDisableRightClick()) {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Also disable F12, Ctrl+Shift+I, Ctrl+U, etc.
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
