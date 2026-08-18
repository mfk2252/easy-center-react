import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import App from './App';
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/programs.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AppProvider>
        <App/>
      </AppProvider>
    </LanguageProvider>
  </StrictMode>
);
