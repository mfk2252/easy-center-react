import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import App from './App';
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App/>
    </AppProvider>
  </StrictMode>
);
