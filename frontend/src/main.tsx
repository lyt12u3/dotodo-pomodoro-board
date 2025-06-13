import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/debug.ts' // Import debug utilities

createRoot(document.getElementById("root")!).render(<App />);
