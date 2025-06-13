import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/debug.ts' // Import debug utilities
import './i18n' // Import i18n configuration

createRoot(document.getElementById("root")!).render(<App />);
