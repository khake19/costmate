import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './app/App';
import { initializeDb } from './app/db';

// Initialize database (seed defaults)
initializeDb();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <HashRouter>
      <App />
      <Toaster position="bottom-center" />
    </HashRouter>
  </StrictMode>
);
