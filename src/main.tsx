import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadPersistedState, setupAutoSave } from './stores/persistence';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastSnackbar } from './components/common/Snackbar';

loadPersistedState().then(() => {
  setupAutoSave();
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
        <ToastSnackbar />
      </ErrorBoundary>
    </React.StrictMode>,
  );
});
