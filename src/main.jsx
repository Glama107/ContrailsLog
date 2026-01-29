import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

// remove loading fallback text once app mounted
// Wait for the app to signal it's ready, then fade out the overlay
const loadingOverlay = document.getElementById('loading-overlay')
function onAppMounted() {
  if (!loadingOverlay) return
  loadingOverlay.classList.add('loaded')
  // remove after transition
  setTimeout(() => loadingOverlay.remove(), 520)
}
window.addEventListener('app-mounted', onAppMounted, { once: true })
