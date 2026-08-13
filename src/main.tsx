import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  const base = '/cosa-nostra-help-board/'
  const path = redirect.replace(location.origin, '')
  const route = path.startsWith(base) ? path.slice(base.length) : path.slice(1)
  history.replaceState(null, '', base + route)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
