import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Meta's WhatsApp sign-up window finishes by returning to this site's address with a one-time
// code. When that happens in the popup, pass the result to the admin page that opened it and close,
// instead of loading the whole site inside the popup.
const returned = new URLSearchParams(window.location.search);
const signupState = returned.get('state') ?? '';
const isSignupReturn = signupState.startsWith('forge-wa-') && (returned.has('code') || returned.has('error'));

if (isSignupReturn) {
  const channel = new BroadcastChannel('forge-wa-signup');
  channel.postMessage({ state: signupState, code: returned.get('code'), error: returned.get('error_description') ?? returned.get('error') });
  channel.close();
  window.history.replaceState(null, '', '/');
  document.body.textContent = 'Finishing up. You can close this window.';
  window.close();
}

if (!isSignupReturn) createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
