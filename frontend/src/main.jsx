import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const clearLegacyCookies = () => {
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    if (name.trim() === 'sessionToken') {
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      console.log('Cleared legacy sessionToken cookie');
    }
  });
};

clearLegacyCookies();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
